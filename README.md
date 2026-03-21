# FinSight AI 💹

An AI-powered financial advisor app designed for students — helping them learn about stocks, manage portfolios, and build financial literacy through smart insights and interactive quizzes.

## 🚀 Features

- 📊 **Stock Tracker** — Real-time stock data and insights
- 💼 **Portfolio Manager** — Track and manage your investments
- 🤖 **AI Chat Advisor** — Ask financial questions, get instant AI-powered answers
- 🧠 **Financial Quiz** — Test and improve your financial knowledge
- 📈 **Dashboard** — Overview of your financial activity

## 🛠️ Tech Stack

**Frontend**
- React.js + Vite
- Tailwind CSS

**Backend**
- FastAPI + Uvicorn
- Python

**AI**
- Groq API (LLaMA)

## 📁 Project Structure
```
finsight/
├── finsight-frontend/     # React frontend
│   ├── src/
│   │   ├── components/    # Navbar, etc.
│   │   ├── pages/         # Dashboard, Stocks, Portfolio
│   │   └── App.jsx
│   └── vite.config.js
│
└── finsight-backend/      # FastAPI backend
    ├── routes/
    │   ├── chat.py
    │   ├── quiz.py
    │   ├── stocks.py
    │   └── portfolio.py
    └── main.py
```

## ⚙️ Getting Started

### Backend
```bash
cd finsight-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd finsight-frontend
npm install
npm run dev
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/chat` | AI chat response |
| GET | `/stocks` | Fetch stock data |
| GET | `/portfolio` | Get portfolio |
| POST | `/quiz` | Generate quiz |

## 👨‍💻 Developer

**Arpit Sharma** — B.Tech CSE, Raj Kumar Goel Institute, Ghaziabad

---

