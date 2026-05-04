import pika
import json
import os
import io
import time
import base64
from pymongo import MongoClient
from hybrid_search import HybridSearcher
import pypdf
import docx

# Configuration
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
QUEUE_NAME = "resume_processing"

# Minimum hybrid score for a match to be considered "relevant"
# Below this threshold, the match is too weak to pass to the LLM
MIN_MATCH_SCORE = 0.25

# Initialize Searcher
searcher = HybridSearcher()

def extract_text(file_bytes: bytes, file_ext: str) -> str:
    """
    Extracts text from PDF or DOCX file bytes held entirely in memory.
    The bytes are never written to disk.
    """
    text = ""
    try:
        if file_ext == ".pdf":
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif file_ext == ".docx":
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text: {e}")
        return None

from llm_client import LLMClient

# Initialize LLM Client
llm_client = LLMClient()

def get_search_weights(corpus_size: int):
    """
    Returns (bm25_weight, semantic_weight) based on corpus size.

    BM25 is unreliable on small corpora because term-frequency statistics
    are meaningless with < 10 documents. On small datasets, semantic search
    alone gives better signal.

    Thresholds (tuned empirically):
      < 5 docs  → heavy semantic bias (BM25 is noise)
      5-15 docs → slight semantic preference
      > 15 docs → balanced 50/50 (BM25 becomes reliable)
    """
    if corpus_size < 5:
        print(f"  [weight] Corpus is tiny ({corpus_size} docs) — using semantic-heavy weights (0.2 BM25, 0.8 Semantic)")
        return 0.2, 0.8
    elif corpus_size < 15:
        print(f"  [weight] Small corpus ({corpus_size} docs) — using balanced-semantic weights (0.35 BM25, 0.65 Semantic)")
        return 0.35, 0.65
    else:
        print(f"  [weight] Large corpus ({corpus_size} docs) — using balanced weights (0.5 BM25, 0.5 Semantic)")
        return 0.5, 0.5

def generate_advice(resume_text, top_matches):
    """Generates intelligent, AI-powered advice using the Groq LLM."""
    if not top_matches:
        return (
            "**No Strong Matches Found**\n\n"
            "Our database did not find interview experiences that closely match your "
            f"profile (minimum required similarity: {MIN_MATCH_SCORE:.0%}). "
            "This could mean:\n"
            "- Your skill set is unique or specialized\n"
            "- Our database doesn't have enough experiences yet for companies in your target area\n\n"
            "**Tip:** Ask your peers to share their interview experiences on Placement Syndicate "
            "so the database grows and matching improves for everyone."
        )

    # Delegate advice generation to the LLM Client
    return llm_client.generate_feedback(resume_text, top_matches)

def callback(ch, method, properties, body):
    """Processes a message from the RabbitMQ queue."""
    message = json.loads(body)
    filename = message['filename']
    file_ext  = message.get('file_ext', '.pdf')
    file_b64  = message.get('file_b64')
    print(f" [x] Received request for: {filename}")

    # 1. Decode file bytes from base64 — stays entirely in memory, never on disk
    if not file_b64:
        print(f" [!] No file content in message for {filename}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    file_bytes = base64.b64decode(file_b64)

    # 2. Extract Resume Text from in-memory bytes
    resume_text = extract_text(file_bytes, file_ext)
    if not resume_text:
        print(f" [!] Failed to extract text from {filename}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    # 2. Connect to MongoDB and fetch experiences
    client = MongoClient(MONGO_URI)
    db = client["experiencedb"]
    experiences = list(db["experience"].find())

    if not experiences:
        print(" [!] No experiences found in MongoDB. Skipping matching.")
        db["resume_feedback"].insert_one({
            "filename": filename,
            "advice": (
                "**Database Empty**\n\n"
                "No interview experiences have been shared yet. "
                "Be the first to add one!"
            ),
            "matches": [],
            "timestamp": time.time(),
            "status": "no_data"
        })
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    corpus_size = len(experiences)
    print(f"  [info] Corpus size: {corpus_size} experiences")

    # 3. Determine weights based on corpus size (fixes BM25 bias on small datasets)
    bm25_weight, semantic_weight = get_search_weights(corpus_size)

    # 4. Perform Hybrid Search with corpus-aware weights and minimum score filter
    searcher.fit(experiences, ["companyName", "role", "quetions", "tips", "rounds"])
    top_matches = searcher.search(
        resume_text,
        top_k=3,
        min_score=MIN_MATCH_SCORE,
        bm25_weight=bm25_weight,
        semantic_weight=semantic_weight
    )

    print(f"  [info] Found {len(top_matches)} match(es) above threshold {MIN_MATCH_SCORE}")
    for m in top_matches:
        print(f"    → {m['document'].get('companyName')} | score={m['score']:.3f} "
              f"(BM25={m['lexical_score']:.3f}, Semantic={m['semantic_score']:.3f})")

    # 5. Generate Advice (Gap Analysis) — only if there are qualified matches
    advice = generate_advice(resume_text, top_matches)

    # 6. Store Feedback in MongoDB
    feedback_doc = {
        "filename": filename,
        "advice": advice,
        "matches": [
            {
                "company": m["document"]["companyName"],
                "score": m["score"],
                "semantic_score": m.get("semantic_score", 0),
                "keyword_score": m.get("lexical_score", 0)
            }
            for m in top_matches
        ],
        "corpus_size": corpus_size,
        "weights_used": {"bm25": bm25_weight, "semantic": semantic_weight},
        "timestamp": time.time(),
        "status": "processed"
    }
    db["resume_feedback"].insert_one(feedback_doc)
    print(f" [x] Advice stored for {filename}")

    # Acknowledge the message
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_engine():
    """Starts the NLP engine listener."""
    print(f" [*] NLP Engine waiting for messages on '{QUEUE_NAME}'...")
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
        channel.start_consuming()
    except Exception as e:
        print(f"NLP Engine failed to connect: {e}")

if __name__ == "__main__":
    from hybrid_search import HybridSearcher
    searcher = HybridSearcher()
    start_engine()
