from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import shutil
import pika
import json
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
QUEUE_NAME = "resume_processing"

# Ensure the upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

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
    allowed_extensions = {".pdf", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        message = {
            "filename": file.filename,
            "file_path": os.path.abspath(file_path),
            "timestamp": datetime.now().isoformat()
        }
        
        published = publish_to_rabbitmq(message)
        
        return {
            "filename": file.filename,
            "status": "success",
            "message": "Resume uploaded and queued for AI analysis",
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
        
        # Remove MongolD _id for JSON serialization
        feedback.pop("_id", None)
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)
