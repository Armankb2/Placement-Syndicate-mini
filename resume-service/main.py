from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import json
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

# Initialize Searcher & LLM using Original Repo Configs
# This uses ChromaDB for persistent vector storage as requested
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

@app.post("/api/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Handles resume upload and analysis synchronously for free-tier compatibility.
    Matches original project logic for processing.
    """
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type.")

    try:
        file_bytes = await file.read()
        resume_text = extract_text(file_bytes, file_ext)
        
        if not resume_text:
            raise HTTPException(status_code=500, detail="Failed to extract text.")

        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        experiences = list(db["experience"].find())

        if not experiences:
            advice = "**No Matching Experiences Found**\n\nNo interview experiences shared yet."
            top_matches = []
        else:
            # Original project weights: 0.2 Lexical / 0.8 Semantic
            searcher.fit(experiences, ["companyName", "role", "quetions", "tips"])
            top_matches = searcher.search(
                resume_text,
                top_k=3,
                min_score=0.1,
                bm25_weight=0.2,
                semantic_weight=0.8
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
        print(f"Error processing resume: {e}")
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

@app.get("/api/resume/similar/{company_name}")
async def get_similar_companies(company_name: str, limit: int = 3):
    """
    Finds companies with similar interview patterns.
    Ported directly from original main.py.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client["experiencedb"]
        target_exps = list(db["experience"].find({"companyName": {"$regex": f"^{company_name}$", "$options": "i"}}))

        if not target_exps:
            raise HTTPException(status_code=404, detail=f"Company '{company_name}' not found.")

        query_text = " ".join([f"{e.get('role', '')} {e.get('quetions', '')} {e.get('tips', '')}" for e in target_exps])
        all_experiences = list(db["experience"].find())
        
        searcher.fit(all_experiences, ["companyName", "role", "quetions", "tips"])
        results = searcher.search(query_text, top_k=limit * 3, min_score=0.1, bm25_weight=0.2, semantic_weight=0.8)

        company_scores = {}
        for r in results:
            name = r["document"]["companyName"]
            if name.lower() == company_name.lower(): continue
            if name not in company_scores or r["score"] > company_scores[name]["score"]:
                company_scores[name] = {
                    "companyName": name,
                    "similarityScore": round(r["score"], 3)
                }

        similar_list = sorted(company_scores.values(), key=lambda x: x["similarityScore"], reverse=True)[:limit]
        return {"targetCompany": company_name, "similar": similar_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)
