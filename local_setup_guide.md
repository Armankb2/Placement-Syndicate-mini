# 🏠 Local Execution Guide

This guide outlines the steps to start the **Placement Syndicate** project on your local machine.

## 📋 Prerequisites
- **Docker Desktop** (Running)
- **Java 21** & **Maven**
- **Node.js 20+**
- **Python 3.10+**

---

## 🚀 Step 1: Start Infrastructure (Docker)
Ensure Docker Desktop is open, then run:
```bash
docker-compose up -d
```
*This starts Postgres (5433), Keycloak (9090), MongoDB (27017), RabbitMQ (5672), and Kafka.*

---

## 🛠️ Step 2: Seed AI Service Data
Before running the AI service for the first time, populate the search engine:
```bash
cd resume-service
source venv/bin/activate  # Or your venv activation command
python seed_data.py
```

---

## 📡 Step 3: Start Backend Services (Open 2 Terminals)

### Terminal 1: Unified Backend (Java)
```bash
cd unified-backend
mvn spring-boot:run
```
*Runs on [http://localhost:8080](http://localhost:8080)*

### Terminal 2: AI Resume Service (Python)
```bash
cd resume-service
source venv/bin/activate
python start_system.py
```
*Runs on [http://localhost:8050](http://localhost:8050)*

---

## 💻 Step 4: Start Frontend
### Terminal 3: React Dashboard
```bash
cd frontend
npm run dev
```
*Runs on [http://localhost:3000](http://localhost:3000)*

---

## 🔑 Access Details
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Keycloak Admin**: [http://localhost:9090](http://localhost:9090) (admin/admin)
- **RabbitMQ Admin**: [http://localhost:15672](http://localhost:15672) (guest/guest)

---

## ⚠️ Important Configuration Notes
1. **Database Port**: The local PostgreSQL is mapped to **5433** to avoid conflicts with any system-wide Postgres you might have on 5432.
2. **Keycloak**: The `mini-project` realm is automatically imported on startup via the `keycloak-realm-export.json` file.
3. **Environment**: The `frontend/.env` file is already pre-configured to point to these local ports.
