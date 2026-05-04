from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import pika
import json
import base64
from datetime import datetime
from hybrid_search import HybridSearcher
from collections import defaultdict

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
QUEUE_NAME = "resume_processing"

# No uploads directory — resumes are processed in-memory and never saved to disk

def publish_to_rabbitmq(message: dict):
    """Publishes a message to the RabbitMQ queue."""
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        return True
    except Exception as e:
        print(f"Failed to publish to RabbitMQ: {e}")
        return False

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a resume file, reads it into memory, and queues it for AI analysis.
    The file is NEVER written to disk — it is base64-encoded and sent directly
    through RabbitMQ to the NLP engine, which processes and discards it.
    """
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are accepted.")

    try:
        # Read file entirely into memory — no disk write
        file_bytes = await file.read()

        # Encode as base64 string so it can be passed through RabbitMQ (JSON-safe)
        file_b64 = base64.b64encode(file_bytes).decode("utf-8")

        message = {
            "filename": file.filename,
            "file_ext": file_ext,
            "file_b64": file_b64,      # raw bytes encoded as base64
            "timestamp": datetime.now().isoformat()
        }

        published = publish_to_rabbitmq(message)

        return {
            "filename": file.filename,
            "status": "success",
            "message": "Resume received and queued for AI analysis. File is not stored.",
            "rabbitmq_status": "published" if published else "failed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resume/feedback/{filename}")
async def get_resume_feedback(filename: str):
    """Retrieves the AI feedback for a given resume from MongoDB."""
    try:
        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        feedback = db["resume_feedback"].find_one({"filename": filename}, sort=[("timestamp", -1)])

        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found yet. Processing might still be in progress.")

        # Remove MongoDB _id for JSON serialization
        feedback.pop("_id", None)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resume/similar/{company_name}")
async def get_similar_companies(company_name: str, limit: int = 3):
    """
    Finds companies with similar interview patterns to the given company.

    How it works:
    1. Fetch all experiences from MongoDB
    2. Build a "profile" for each company by combining its questions, tips, and role text
    3. Use HybridSearcher (BM25 + Semantic) to find companies most similar to the target
    4. Return ranked list of similar companies (excluding the target itself)

    This powers the "Similar Companies" feature on the experience detail page.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        all_experiences = list(db["experience"].find())

        if not all_experiences:
            return {"similar": [], "message": "No experiences in database yet."}

        # Group experiences by company and build a text profile per company
        company_profiles = defaultdict(list)
        for exp in all_experiences:
            name = exp.get("companyName", "").strip()
            if not name:
                continue
            # Extract round texts
            rounds_text = ""
            if "rounds" in exp and isinstance(exp["rounds"], list):
                for r in exp["rounds"]:
                    if isinstance(r, dict):
                        rounds_text += " ".join([str(v) for k, v in r.items() if k != "_class"]) + " "

            # Concatenate all text fields that describe the interview
            profile_text = " ".join(filter(None, [
                exp.get("role", ""),
                exp.get("quetions", ""),
                exp.get("tips", ""),
                str(exp.get("difficultyLevel", "")),
                rounds_text
            ]))
            company_profiles[name].append(profile_text)

        # Build one aggregated text profile per company
        unique_companies = list(company_profiles.keys())

        # Check the target company exists
        normalized_target = company_name.strip().lower()
        matched_key = next(
            (k for k in unique_companies if k.lower() == normalized_target),
            None
        )

        if not matched_key:
            raise HTTPException(
                status_code=404,
                detail=f"Company '{company_name}' not found in database. Check the company name."
            )

        # Build document list for HybridSearcher: one doc per company
        company_docs = []
        for company, texts in company_profiles.items():
            company_docs.append({
                "companyName": company,
                "profile": " ".join(texts)
            })

        # Use HybridSearcher to find companies similar to the target company
        # Query = the target company's profile text
        target_profile = " ".join(company_profiles[matched_key])

        # Need at least 2 companies to find "similar" ones
        if len(company_docs) < 2:
            return {
                "similar": [],
                "message": "Not enough companies in the database to suggest similar ones yet."
            }

        searcher = HybridSearcher()
        searcher.fit(company_docs, ["profile"])

        # Fetch top_k = limit + 1 (we'll filter out the target itself)
        results = searcher.search(
            target_profile,
            top_k=limit + 1,
            min_score=0.1  # Low threshold since we're doing company-to-company matching
        )

        # Remove the target company from results (it matches itself perfectly)
        similar = [
            {
                "companyName": r["document"]["companyName"],
                "similarityScore": round(r["score"], 3),
                "semanticScore": round(r.get("semantic_score", 0), 3),
                "keywordScore": round(r.get("lexical_score", 0), 3),
            }
            for r in results
            if r["document"]["companyName"].lower() != normalized_target
        ][:limit]

        return {
            "targetCompany": matched_key,
            "similar": similar,
            "totalCompaniesInDB": len(unique_companies)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)
