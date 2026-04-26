import subprocess
import os
import sys

def start_services():
    """Starts the entire Resume Processing & NLP system."""
    print("🚀 Starting Resume Processing & NLP System...")

    # Define the commands
    fastapi_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--port", "8050"]
    nlp_cmd = [sys.executable, "nlp_engine.py"]

    # Start the processes
    print("  -> Starting Upload Service (FastAPI Port 8050)...")
    fastapi_process = subprocess.Popen(fastapi_cmd)

    print("  -> Starting Hybrid Search NLP Engine...")
    nlp_process = subprocess.Popen(nlp_cmd)

    print("\n✅ System is fully operational!")
    print(" - Backend: http://localhost:8050")
    print(" - NLP Engine: Listening to RabbitMQ")
    print(" - Press CTRL+C to stop the system safely.\n")

    try:
        # Wait for processes to finish
        fastapi_process.wait()
        nlp_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down system...")
        fastapi_process.terminate()
        nlp_process.terminate()
        print("Done.")

if __name__ == "__main__":
    start_services()
