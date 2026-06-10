# 🚀 Distributed Task Processing System

A production-style distributed system that processes user-uploaded images asynchronously using a microservices architecture.

---

## 🌍 Live Demo

👉 https://task-api-service-production-35ef.up.railway.app/

---

## 🧠 Architecture

```
Frontend (HTML)
   ↓
API (Node.js - Express)
   ↓
Redis Queue
   ↓
Worker Service
   ↓
Cloudinary (image storage)
```

---

## ⚙️ Tech Stack

### Backend

- Node.js
- Express.js
- Redis (queue system)
- Multer (file upload)
- Cloudinary (cloud image storage)

### DevOps & Infrastructure

- Docker (containerization)
- Kubernetes (local orchestration: deployments, services, scaling)
- GitHub Actions (CI/CD)
- Railway (cloud deployment - no-cost environment)

### Monitoring

- Logs via Railway

---

## 🚀 Features

- 📤 Upload images via frontend
- ⚡ Asynchronous task processing (API → Redis → Worker)
- 🔄 Scalable worker system
- ☁️ Cloud image storage (Cloudinary)
- 🔄 Auto deployment with CI/CD
- 📊 Basic monitoring with logs + health endpoint

---

## 🔄 How It Works

1. User uploads an image from the frontend
2. API receives the file using Multer
3. Image is stored in Cloudinary
4. API pushes a task into Redis queue
5. Worker pulls tasks from Redis
6. Worker processes tasks asynchronously

---

## ☸️ Kubernetes (Local Environment)

The system was fully containerized and orchestrated locally using Kubernetes:

- Deployments for API and Worker
- Services for internal communication
- Horizontal scaling of worker pods
- Redis deployed as a service inside the cluster

👉 Due to cloud limitations (no paid services), production deployment was done using Railway instead of managed Kubernetes.

---

## 🔄 CI/CD Pipeline

- GitHub Actions used for automation
- On every push:
  - Build Docker images
  - Deploy automatically to Railway

---

## 📊 Monitoring & Reliability

- Centralized logs via Railway dashboard
- Worker system ensures tasks are processed even under load

---

## 💡 Key Concepts Demonstrated

- Microservices architecture
- Producer / Consumer pattern
- Asynchronous processing with queues
- Containerization with Docker
- Orchestration with Kubernetes
- Cloud deployment constraints adaptation

---

## 📌 Future Improvements

- Advanced monitoring (Grafana)
- Authentication system
- Persistent Redis storage
- Full cloud Kubernetes deployment (EKS/GKE)

---

## ⚖️ Deployment Strategy

This project was initially designed and orchestrated locally using Kubernetes (Docker Desktop), where I implemented deployments, services, and horizontal scaling.

For production deployment, I adapted the system to run on Railway, a no-cost cloud platform, due to infrastructure constraints (no access to managed Kubernetes services).

This demonstrates the ability to:

- Design systems using Kubernetes principles
- Adapt architecture to different environments
- Deploy real-world applications under practical limitations

## 👩‍💻 Author

Built as a hands-on project to practice real-world backend, DevOps, and cloud architecture.
