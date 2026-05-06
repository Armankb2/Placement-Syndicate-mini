from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import json
import base64
import io
import time
from datetime import datetime
import pypdf
import docx
from hybrid_search import HybridSearcher
from llm_client import LLMClient

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MIN_MATCH_SCORE = 0.25

# Initialize Searcher & LLM
searcher = HybridSearcher()
llm_client = LLMClient()

def extract_text(file_bytes: bytes, file_ext: str) -> str:
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

def get_search_weights(corpus_size: int):
    if corpus_size < 5:
        return 0.2, 0.8
    elif corpus_size < 15:
        return 0.35, 0.65
    else:
        return 0.5, 0.5

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        resume_text = extract_text(file_bytes, file_ext)
        
        if not resume_text:
            raise HTTPException(status_code=500, detail="Failed to extract text.")

        # Process Synchronously for Production Simplicity (Free Tier)
        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        experiences = list(db["experience"].find())

        if not experiences:
            advice = "**Database Empty**\n\nNo interview experiences shared yet."
            top_matches = []
        else:
            corpus_size = len(experiences)
            bm25_weight, semantic_weight = get_search_weights(corpus_size)
            
            searcher.fit(experiences, ["companyName", "role", "quetions", "tips", "rounds"])
            top_matches = searcher.search(
                resume_text,
                top_k=3,
                min_score=MIN_MATCH_SCORE,
                bm25_weight=bm25_weight,
                semantic_weight=semantic_weight
            )
            advice = llm_client.generate_feedback(resume_text, top_matches)

        feedback_doc = {
            "filename": file.filename,
            "advice": advice,
            "matches": [
                {
                    "company": m["document"]["companyName"],
                    "score": m["score"]
                }
                for m in top_matches
            ],
            "timestamp": time.time(),
            "status": "processed"
        }
        db["resume_feedback"].insert_one(feedback_doc)

        return {
            "filename": file.filename,
            "status": "success",
            "message": "Resume processed successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resume/feedback/{filename}")
async def get_resume_feedback(filename: str):
    try:
        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        feedback = db["resume_feedback"].find_one({"filename": filename}, sort=[("timestamp", -1)])

        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found.")

        feedback.pop("_id", None)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)
