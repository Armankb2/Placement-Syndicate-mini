import pika
import json
import os
import time
from pymongo import MongoClient
from hybrid_search import HybridSearcher
import pypdf
import docx

# Configuration
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
QUEUE_NAME = "resume_processing"

# Initialize Searcher
searcher = HybridSearcher()

def extract_text(file_path):
    """Extracts text from PDF or DOCX files."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    try:
        if ext == ".pdf":
            with open(file_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        elif ext == ".docx":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return None

from llm_client import LLMClient

# Initialize LLM Client
llm_client = LLMClient()

def generate_advice(resume_text, top_matches):
    """Generates intelligent, AI-powered advice using the Groq LLM."""
    if not top_matches:
        return "No matching experiences found in our database yet. Check back later!"

    # Delegate advice generation to the LLM Client
    return llm_client.generate_feedback(resume_text, top_matches)

def callback(ch, method, properties, body):
    """Processes a message from the RabbitMQ queue."""
    message = json.loads(body)
    filename = message['filename']
    file_path = message['file_path']
    print(f" [x] Received request for: {filename}")

    # 1. Extract Resume Text
    resume_text = extract_text(file_path)
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
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    # 3. Perform Hybrid Search
    searcher.fit(experiences, ["companyName", "role", "quetions", "tips"])
    top_matches = searcher.search(resume_text, top_k=3)

    # 4. Generate Advice (Gap Analysis)
    advice = generate_advice(resume_text, top_matches)

    # 5. Store Feedback in MongoDB
    feedback_doc = {
        "filename": filename,
        "advice": advice,
        "matches": [{"company": m["document"]["companyName"], "score": m["score"]} for m in top_matches],
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
    from hybrid_search import HybridSearcher # Importing it properly
    searcher = HybridSearcher()
    start_engine()
