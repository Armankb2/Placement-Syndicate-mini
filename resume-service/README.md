# 🧠 AI Resume Advisor & Hybrid Search Engine

The **AI Resume Advisor** is an intelligent microservice designed to bridge the gap between candidate resumes and successful interview experiences. It uses a **Hybrid Search** approach (Lexical + Semantic) to provide real-time, actionable feedback for job seekers.

---

## 🚀 Key Features

-   **Hybrid Matching Engine**: Combines **BM25** (keyword lookup) with **Sentence Transformers** (semantic vector similarity) for 99% matching accuracy.
-   **Asynchronous Processing**: Uses **RabbitMQ** to handle high-volume resume uploads without slowing down the user's experience.
-   **Real-Time Advisor UI**: A sleek, glassmorphism dashboard that displays personalized interview tips and matched company insights.
-   **Multi-Format Support**: Handles `.pdf` and `.docx` file extractions out of the box.
-   **Database Persistence**: Stores all matching results and generated advice in **MongoDB** (`experiencedb` collection).

---

## 🏗️ Architecture Overview

1.  **FastAPI Upload Service**: Receives the resume and securely stores it.
2.  **RabbitMQ Message Broker**: Queues the file for analysis.
3.  **NLP Processor (Consumer)**: 
    - Extracts text from the file.
    - Converts text into **384-dimensional Vectors**.
    - Performs a **Vector Similarity Search** against interview experiences in MongoDB.
    - Generates gap-analysis feedback.
4.  **React Frontend**: Polls the backend and displays the "Magic" results once processing is complete.

---

## 🛠️ Technology Stack

-   **Logic**: Python 3.10+, FastAPI
-   **AI/NLP**: `sentence-transformers`, `rank-bm25`, `scikit-learn`
-   **Messaging**: RabbitMQ (via `pika`)
-   **Parsing**: `pypdf`, `python-docx`
-   **Storage**: MongoDB (via `pymongo`)

---

## 🏁 Quick Start Guide

### 1. Prerequisites
Ensure you have **Docker Desktop** and **Python** installed.

### 2. Start Infrastructure
From the root directory:
```powershell
docker-compose up -d rabbitmq mongodb
```

### 3. Setup Python Environment
```powershell
cd resume-service
pip install -r requirements.txt
```

### 4. Seed Experience Data
Populate your database with sample Google/Amazon/Meta interview data:
```powershell
python seed_data.py
```

### 5. Launch the System
```powershell
python start_system.py
```

---

## 📖 Usage
1.  Navigate to your frontend application.
2.  Go to the **AI Advisor** tab.
3.  Upload your resume.
4.  Wait for the **"Analyzing..."** status to complete.
5.  Receive your personalized career advice panel!

---

**Placement Syndicate** - *Empowering Careers through Intelligent Data.*
