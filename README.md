# FinSight AI 💹

> An AI-powered financial literacy platform built for college students — featuring real-time stock tracking, virtual portfolio management, a financial quiz, and an AI chat advisor powered by LLaMA via Groq.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=flat-square)
![Backend](https://img.shields.io/badge/Backend-Flask%20(Python)-green?style=flat-square)
![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-orange?style=flat-square)
![AI](https://img.shields.io/badge/AI-LLaMA%20via%20Groq-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 Auth | JWT-based secure login & registration |
| 📊 Dashboard | Live portfolio value, P&L, and top holdings |
| 📈 Stock Tracker | Real-time prices via Yahoo Finance (NSE + NASDAQ) |
| 💼 Portfolio | Add/remove stocks, track invested vs current value |
| 🧠 AI Advisor | Chat with LLaMA (Groq API) for financial advice |
| 🎯 Quiz | Financial literacy quiz with scoring |
| 👤 Onboarding | Personalized profile setup on first login |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- Vanilla CSS (custom dark theme with glassmorphism)
- Chart.js for portfolio visualizations

### Backend
- **Python 3** + **Flask**
- **SQLAlchemy** ORM
- **JWT** authentication
- **httpx** for async Yahoo Finance API calls
- **Groq API** (LLaMA 3) for AI chat

### Database
- **SQLite** (local development)
- **PostgreSQL** (production on AWS RDS)

---

## 📁 Project Structure

```
Finsight--Ai/
├── src/                        # React frontend
│   ├── pages/
│   │   ├── Auth.jsx            # Login & Register
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Stocks.jsx          # Stock tracker
│   │   ├── Portfolio.jsx       # Portfolio manager
│   │   ├── Chat.jsx            # AI advisor chat
│   │   ├── Quiz.jsx            # Finance quiz
│   │   └── Onboarding.jsx      # User setup
│   ├── components/
│   │   └── Navbar.jsx
│   └── App.jsx
├── finsight-backend/           # Flask backend
│   ├── routes/
│   │   ├── auth.py             # /auth/* endpoints
│   │   ├── user.py             # /user/* endpoints
│   │   ├── stocks.py           # /stocks endpoint
│   │   ├── quiz.py             # /quiz endpoint
│   │   └── chat.py             # /chat endpoint
│   ├── main.py                 # Flask app entry point
│   ├── models.py               # SQLAlchemy DB models
│   ├── database.py             # DB session setup
│   ├── auth_utils.py           # JWT helper functions
│   ├── stock_utils.py          # Yahoo Finance fetcher
│   ├── schemas.py              # Pydantic-style validators
│   └── requirements.txt
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/arpitsharma30/Finsight--Ai.git
cd Finsight--Ai
```

### 2. Setup the Backend
```bash
cd finsight-backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your values

# Start the backend
python main.py
```
Backend runs at: `http://localhost:8000`

### 3. Setup the Frontend
```bash
# From project root
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `finsight-backend/.env` file. See [.env.example](finsight-backend/.env.example) for reference.

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Optional | Groq API key for LLaMA AI chat. Falls back to local responses if not set. |
| `SQLALCHEMY_DATABASE_URL` | Optional | PostgreSQL URL for production. Defaults to local SQLite. |
| `SECRET_KEY` | Optional | JWT signing secret. Defaults to a dev key. |

---

## 🔐 Getting a Free Groq API Key

1. Go to 👉 **https://console.groq.com**
2. Sign up (it's free)
3. Click **API Keys** → **Create API Key**
4. Paste it in your `.env` as `GROQ_API_KEY=your_key_here`

Without this key, the AI chat works in local fallback mode with pre-written financial responses.

---

## ☁️ Production Deployment (AWS Free Tier)

This app is designed to be deployed on AWS using:
- **Amazon EC2** (Ubuntu) — Flask backend
- **Amazon S3** — React frontend static hosting
- **Amazon RDS** (PostgreSQL) — Production database
- **Amazon CloudFront** — CDN for frontend (HTTPS)

---

## 📄 License

MIT © [Arpit Sharma](https://github.com/arpitsharma30)
