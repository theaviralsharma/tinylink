# 🔗 TinyLink — URL Shortener  
A lightweight, full-stack URL shortener built using **Node.js**, **Express**, **MongoDB Atlas**, and **EJS**.  
TinyLink lets users create short URLs, track click analytics, view stats, and manage links — all through a clean and responsive dashboard.

🚀 **Live Demo:**  
https://tinylink-t6xg.onrender.com

---

## 📑 Features

### ✔ Core Functionalities
- Create short links with:
  - **Auto-generated codes** (6–8 alphanumeric)
  - **Custom codes** (validated)
- Redirect short URLs with **302 status**
- Track analytics:
  - Total clicks
  - Last clicked timestamp
  - Created date
- View stats for each link (`/code/:code`)
- Delete links (UI + API)
- Fully responsive dashboard (TailwindCSS)
- Dark mode (with persistence using localStorage)

### ✔ API Endpoints
- `POST /api/links` — Create a short link  
- `GET /api/links` — Get all links  
- `GET /api/links/:code` — Get a single link  
- `DELETE /api/links/:code` — Delete a link  
- `GET /healthz` — Health check endpoint  

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ORM

### Frontend
- EJS (server-side UI templates)
- TailwindCSS
- Vanilla JavaScript

### Deployment
- Render (Web Service)
- MongoDB Atlas (Cloud Database)

---

## 🚀 Getting Started (Local Development)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/theaviralsharma/tinylink.git
cd tinylink