from flask import Flask, request, jsonify
from database import engine, SessionLocal
import models
import auth_utils
import stock_utils
import asyncio
import os
import logging
import datetime
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = Flask("FinSight-AI")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finsight-backend")

# Configure CORS
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

# Handle pre-flight CORS OPTIONS requests
@app.route('/<path:path>', methods=['OPTIONS'])
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
def options_handler(path):
    return "", 200

# Attach DB Session to Request Lifecycle
@app.before_request
def before_request():
    request.db = SessionLocal()

@app.teardown_request
def teardown_request(exception=None):
    db = getattr(request, 'db', None)
    if db is not None:
        db.close()

# Token Authentication Decorator
def token_required(f):
    def decorator(*args, **kwargs):
        user = auth_utils.get_current_user_from_request(request.db)
        if not user:
            return jsonify({"detail": "Authentication failed or token expired."}), 401
        return f(user, *args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

# Helper for Risk Levels
def get_risk_level(loss_reaction: int) -> str:
    if loss_reaction == 1:
        return "Conservative"
    elif loss_reaction == 2:
        return "Moderate"
    elif loss_reaction == 3:
        return "Aggressive"
    return "Moderate"

def serialize_profile(profile: models.Profile) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "age": profile.age,
        "monthly_savings": profile.monthly_savings,
        "income": profile.income,
        "loss_reaction": profile.loss_reaction,
        "goal": profile.goal,
        "horizon": profile.horizon,
        "experience": profile.experience,
        "risk_level": get_risk_level(profile.loss_reaction)
    }

# --- HEALTH CHECK ---
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "app": "FinSight AI API (Flask)",
        "message": "Welcome to the financial advisory system API!"
    })

# --- AUTHENTICATION ---
@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
        return jsonify({"detail": "Name, email and password are required."}), 400
        
    existing_user = request.db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        return jsonify({"detail": "A user with this email already exists."}), 400
        
    hashed_pwd = auth_utils.get_password_hash(password)
    user = models.User(name=name, email=email, hashed_password=hashed_pwd)
    request.db.add(user)
    request.db.commit()
    request.db.refresh(user)
    
    token = auth_utils.create_access_token(user.id)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    })

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"detail": "Email and password are required."}), 400
        
    user = request.db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth_utils.verify_password(password, user.hashed_password):
        return jsonify({"detail": "Invalid email or password."}), 401
        
    token = auth_utils.create_access_token(user.id)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    })

@app.route("/auth/me", methods=["GET"])
@token_required
def get_me(user):
    token = auth_utils.create_access_token(user.id)
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    })

# --- USER PROFILE & GOALS ---
@app.route("/user/profile", methods=["GET"])
@token_required
def get_profile(user):
    profile = request.db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    if not profile:
        return jsonify({"profile": None})
    return jsonify({"profile": serialize_profile(profile)})

@app.route("/user/profile", methods=["POST"])
@token_required
def create_profile(user):
    data = request.json or {}
    profile = request.db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    
    try:
        age = int(data.get("age", 0))
        monthly_savings = float(data.get("monthly_savings", 0))
        income = float(data.get("income", 0))
        loss_reaction = int(data.get("loss_reaction", 2))
        goal = str(data.get("goal", ""))
        horizon = str(data.get("horizon", ""))
        experience = str(data.get("experience", ""))
    except ValueError:
        return jsonify({"detail": "Invalid numeric fields."}), 400
        
    if profile:
        profile.age = age
        profile.monthly_savings = monthly_savings
        profile.income = income
        profile.loss_reaction = loss_reaction
        profile.goal = goal
        profile.horizon = horizon
        profile.experience = experience
    else:
        profile = models.Profile(
            user_id=user.id, age=age, monthly_savings=monthly_savings,
            income=income, loss_reaction=loss_reaction, goal=goal,
            horizon=horizon, experience=experience
        )
        request.db.add(profile)
        
    request.db.commit()
    request.db.refresh(profile)
    return jsonify(serialize_profile(profile))

@app.route("/user/goals", methods=["POST"])
@token_required
def save_goal(user):
    data = request.json or {}
    title = data.get("title")
    target_amount = float(data.get("target_amount", 0))
    target_date = data.get("target_date")
    monthly_contribution = float(data.get("monthly_contribution", 0))
    
    if not title or not target_date:
        return jsonify({"detail": "Title and target date are required."}), 400
        
    goal = request.db.query(models.Goal).filter(models.Goal.user_id == user.id, models.Goal.title == title).first()
    if goal:
        goal.target_amount = target_amount
        goal.target_date = target_date
        goal.monthly_contribution = monthly_contribution
    else:
        goal = models.Goal(
            user_id=user.id, title=title, target_amount=target_amount,
            target_date=target_date, monthly_contribution=monthly_contribution
        )
        request.db.add(goal)
        
    request.db.commit()
    request.db.refresh(goal)
    
    return jsonify({
        "id": goal.id, "user_id": goal.user_id, "title": goal.title,
        "target_amount": goal.target_amount, "target_date": goal.target_date,
        "monthly_contribution": goal.monthly_contribution,
        "created_at": goal.created_at.isoformat()
    })

# --- PORTFOLIO & TRANSACTIONS ---
@app.route("/user/transactions", methods=["POST"])
@token_required
def add_transaction(user):
    data = request.json or {}
    symbol = data.get("symbol", "").upper().strip()
    name = data.get("name")
    qty = float(data.get("qty", 0))
    buy_price = float(data.get("buy_price", 0))
    exchange = data.get("exchange", "NSE")
    
    if not symbol or not name or qty <= 0 or buy_price <= 0:
        return jsonify({"detail": "Invalid transaction data."}), 400
        
    holding = request.db.query(models.Holding).filter(
        models.Holding.user_id == user.id, 
        models.Holding.symbol == symbol
    ).first()
    
    if holding:
        total_cost = (holding.qty * holding.buy_price) + (qty * buy_price)
        total_qty = holding.qty + qty
        holding.buy_price = round(total_cost / total_qty, 2)
        holding.qty = total_qty
    else:
        holding = models.Holding(
            user_id=user.id, symbol=symbol, name=name, qty=qty,
            buy_price=buy_price, exchange=exchange
        )
        request.db.add(holding)
        
    request.db.commit()
    request.db.refresh(holding)
    
    live_stock = asyncio.run(stock_utils.fetch_stock_price(holding.symbol))
    current_price = live_stock["price"]
    val = holding.qty * current_price
    gain_pct = ((current_price - holding.buy_price) / holding.buy_price) * 100.0 if holding.buy_price > 0 else 0.0
    
    return jsonify({
        "symbol": holding.symbol,
        "name": holding.name,
        "qty": holding.qty,
        "buy_price": holding.buy_price,
        "current_price": current_price,
        "gain_pct": round(gain_pct, 2),
        "value": round(val, 2),
        "allocation": 100.0
    })

def calculate_portfolio_data(user):
    holdings = request.db.query(models.Holding).filter(models.Holding.user_id == user.id).all()
    if not holdings:
        return {
            "total_value": 0.0, "total_gain": 0.0, "gain_pct": 0.0, "holdings": []
        }
        
    total_value = 0.0
    total_cost = 0.0
    holding_details = []
    
    for h in holdings:
        live_stock = asyncio.run(stock_utils.fetch_stock_price(h.symbol))
        curr_price = live_stock["price"]
        val = h.qty * curr_price
        cost = h.qty * h.buy_price
        
        total_value += val
        total_cost += cost
        
        gain_pct = ((curr_price - h.buy_price) / h.buy_price) * 100.0 if h.buy_price > 0 else 0.0
        
        holding_details.append({
            "symbol": h.symbol, "name": h.name, "qty": h.qty, "buy_price": h.buy_price,
            "current_price": curr_price, "gain_pct": round(gain_pct, 2), "value": round(val, 2),
            "allocation": 0.0
        })
        
    for hd in holding_details:
        if total_value > 0:
            hd["allocation"] = round((hd["value"] / total_value) * 100.0, 2)
            
    total_gain = total_value - total_cost
    gain_pct = (total_gain / total_cost) * 100.0 if total_cost > 0 else 0.0
    
    return {
        "total_value": round(total_value, 2),
        "total_gain": round(total_gain, 2),
        "gain_pct": round(gain_pct, 2),
        "holdings": holding_details
    }

@app.route("/user/portfolio", methods=["GET"])
@token_required
def get_portfolio(user):
    data = calculate_portfolio_data(user)
    return jsonify(data)

@app.route("/user/dashboard", methods=["GET"])
@token_required
def get_dashboard(user):
    profile = request.db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
    
    # Calculate portfolio values directly using helper function
    portfolio_res = calculate_portfolio_data(user)
    
    ai_tip = "The SIP strategy — investing a fixed amount monthly — reduces market volatility impact through rupee cost averaging."
    if profile:
        risk = get_risk_level(profile.loss_reaction)
        if risk == "Conservative":
            ai_tip = "Given your conservative profile, focus on high-quality debt funds, sovereign gold bonds, and large-cap indexes to preserve your capital."
        elif risk == "Moderate":
            ai_tip = "A diversified 60:40 equity to debt mix matches your moderate risk profile, smoothing out short-term fluctuations."
        elif risk == "Aggressive":
            ai_tip = "Your aggressive stance is suitable for small/midcap equity mutual funds. Stay invested long-term to ride out market volatility."
            
    portfolio_res["ai_tip"] = ai_tip
    
    return jsonify({
        "profile": serialize_profile(profile) if profile else None,
        "portfolio": portfolio_res
    })

# --- STOCK ENDPOINTS ---
@app.route("/stocks", methods=["GET"])
def list_stocks():
    symbol = request.args.get("symbol")
    if not symbol:
        stock_list = []
        for sym in stock_utils.DEFAULT_STOCKS.keys():
            live_data = asyncio.run(stock_utils.fetch_stock_price(sym))
            stock_list.append(live_data)
        return jsonify({"stocks": stock_list})
        
    search_term = symbol.upper().strip()
    matched_keys = [k for k in stock_utils.DEFAULT_STOCKS.keys() if search_term in k or search_term in stock_utils.DEFAULT_STOCKS[k]["name"].upper()]
    
    if matched_keys:
        stock_list = []
        for key in matched_keys:
            live_data = asyncio.run(stock_utils.fetch_stock_price(key))
            stock_list.append(live_data)
        return jsonify({"stocks": stock_list})
        
    try:
        live_data = asyncio.run(stock_utils.fetch_stock_price(search_term))
        if live_data["price"] != 100.0 or live_data["symbol"] == search_term:
            return jsonify({"stocks": [live_data]})
    except Exception:
        pass
        
    return jsonify({"stocks": []})

# --- QUIZ ENDPOINTS ---
QUIZ_BANK = {
    "finance basics": [
        {
            "question": "What is a mutual fund?",
            "options": [
                "A single stock investment",
                "A pool of investor money managed professionally",
                "A type of government bond",
                "A savings account"
            ],
            "correct": 1,
            "explanation": "A mutual fund pools money from multiple investors and invests in a diversified portfolio of stocks, bonds, or securities managed by professionals."
        },
        {
            "question": "What does SIP stand for in investing?",
            "options": [
                "Stock Investment Plan",
                "Systematic Investment Plan",
                "Secure Investment Portfolio",
                "Simple Index Purchase"
            ],
            "correct": 1,
            "explanation": "SIP (Systematic Investment Plan) lets you invest a fixed amount at regular intervals, helping build wealth through compounding and rupee cost averaging."
        },
        {
            "question": "What is inflation?",
            "options": [
                "The increase in purchasing power of money",
                "The rate at which the general level of prices for goods and services is rising",
                "The process of printing new banknotes",
                "A type of tax on stock market gains"
            ],
            "correct": 1,
            "explanation": "Inflation is the general rise in prices over time, which reduces the purchasing power of your money."
        },
        {
            "question": "Which of the following is generally considered lower risk?",
            "options": [
                "Individual stocks",
                "Cryptocurrency",
                "Diversified mutual fund",
                "Penny stocks"
            ],
            "correct": 2,
            "explanation": "Diversified mutual funds spread risk across many assets, making them generally safer than individual stocks, penny stocks, or crypto."
        },
        {
            "question": "What is the primary purpose of an emergency fund?",
            "options": [
                "To buy stocks during a market dip",
                "To pay for luxury vacations",
                "To cover 3-6 months of essential living expenses during unexpected events",
                "To earn high interest rates"
            ],
            "correct": 2,
            "explanation": "An emergency fund acts as a financial safety net to cover essential expenses in case of job loss, medical emergencies, or unforeseen repairs."
        }
    ],
    "investing basics": [
        {
            "question": "What is the P/E ratio used for?",
            "options": [
                "Measuring company debt",
                "Valuing a stock relative to its earnings",
                "Calculating dividend yield",
                "Tracking revenue growth"
            ],
            "correct": 1,
            "explanation": "The Price-to-Earnings (P/E) ratio compares a stock's price to its earnings per share, helping assess if it is overvalued or undervalued."
        },
        {
            "question": "What is an index fund?",
            "options": [
                "A fund managed by an expert to beat the market",
                "A fund that tracks a market index like Nifty 50 or S&P 500",
                "A fund that only invests in bonds",
                "A fund for high-net-worth individuals"
            ],
            "correct": 1,
            "explanation": "An index fund passively tracks a market index, matching its performance at lower management fees."
        },
        {
            "question": "What is diversification in investing?",
            "options": [
                "Putting all your money into a single high-performing stock",
                "Spreading investments across different asset classes and sectors to reduce risk",
                "Opening multiple bank accounts",
                "Investing only in foreign countries"
            ],
            "correct": 1,
            "explanation": "Diversification reduces risk by spreading your investments across different assets (stocks, bonds, real estate) so that a drop in one doesn't wipe out your whole portfolio."
        }
    ]
}

@app.route("/quiz", methods=["POST"])
def get_quiz():
    data = request.json or {}
    topic = data.get("topic", "finance basics").lower().strip()
    questions = QUIZ_BANK.get(topic, QUIZ_BANK["finance basics"])
    return jsonify({"questions": questions})

# --- CHAT ADVISOR ENDPOINTS ---
SYSTEM_PROMPT = """
You are FinSight AI, a friendly, expert financial advisor specifically designed for university students. 
Your goal is to explain finance simply, using zero jargon, and provide actionable advice.
Focus on concepts like budgeting (e.g., the 50/30/20 rule), Systematic Investment Plans (SIPs), index funds, 
the power of compounding, and building an emergency fund. 
Always warn students against high-risk behaviors like day trading, options trading, or heavy crypto speculation.
Keep your answers engaging, encouraging, and limited to 2-3 short paragraphs.
"""

def generate_local_response(msg: str) -> str:
    msg_lower = msg.lower()
    
    # Check for stock price queries first
    if any(keyword in msg_lower for keyword in ["price", "cost", "value", "quote", "rate", "how much"]):
        for sym, details in stock_utils.DEFAULT_STOCKS.items():
            # Check if symbol or first word of name is in the query
            if sym.lower() in msg_lower or details["name"].lower().split(" ")[0] in msg_lower:
                try:
                    live_data = asyncio.run(stock_utils.fetch_stock_price(sym))
                    price = live_data["price"]
                    change = live_data["change"]
                    name = live_data["name"]
                    direction = "up 📈" if change >= 0 else "down 📉"
                    sign = "+" if change >= 0 else ""
                    return (
                        f"The live price of **{name} ({sym})** is **₹{price:,.2f}** ({live_data['exchange']}), "
                        f"which is {direction} by **{sign}{change}%** today.\n\n"
                        f"Keeping track of top companies like {sym} is a great way to learn market patterns. "
                        f"Would you like to know how to add this stock to your virtual portfolio?"
                    )
                except Exception:
                    pass

    if "sip" in msg_lower or "systematic" in msg_lower:
        return (
            "A Systematic Investment Plan (SIP) is a student's best friend! 🚀 It allows you to invest a fixed amount of money "
            "(as low as ₹100 or ₹500) into a mutual fund regularly (e.g., monthly).\n\n"
            "This uses a strategy called **Rupee Cost Averaging**. When the market is down, your ₹500 buys more units; when the market "
            "is up, it buys fewer. Over time, this smooths out market volatility, so you don't have to worry about timing the market!"
        )
    elif "mutual fund" in msg_lower or "index fund" in msg_lower:
        return (
            "Think of a **Mutual Fund** as a giant shopping basket. Instead of buying just one stock (like Apple or Reliance), thousands of "
            "investors pool their money together, and a professional manager buys a mix of 50-100 different stocks.\n\n"
            "An **Index Fund** is a special type of mutual fund that simply copies a market index (like the Nifty 50 or S&P 500) automatically. "
            "Because there's no expensive manager to pay, index funds have ultra-low fees, making them the perfect starter investment for students!"
        )
    elif "stock" in msg_lower or "equity" in msg_lower or "share" in msg_lower:
        return (
            "Buying a **Stock** means you are purchasing a tiny piece of ownership in a company. If the company grows and makes profits, "
            "your stock value goes up. If it does poorly, your investment drops.\n\n"
            "For students, investing in individual stocks is fun but carries higher risk. It requires deep research. "
            "A safer approach is to put the bulk of your money in index funds and allocate only a small, experimental amount to individual companies you love."
        )
    elif "budget" in msg_lower or "save" in msg_lower or "savings" in msg_lower:
        return (
            "The easiest way to start budgeting as a student is the **50/30/20 Rule**: \n"
            "• **50% Needs**: Essential costs like rent, groceries, and tuition.\n"
            "• **30% Wants**: Fun spending like eating out, movies, and hobbies.\n"
            "• **20% Savings/Investing**: Money set aside for your future self!\n\n"
            "Try automating this. The day you get your allowance or income, automatically send 20% to a separate account or mutual fund so you don't spend it."
        )
    elif "risk" in msg_lower or "loss" in msg_lower:
        return (
            "Risk is a natural part of investing, but it can be managed! The golden rule is **Diversification** (not putting all your eggs in one basket). "
            "If you invest in 100 companies, a crash in one won't hurt you much.\n\n"
            "Also, never invest money you will need in the next 1-2 years. Always build a small **Emergency Fund** (e.g., 3 months of basic expenses) "
            "in a high-interest savings account before you start investing in the stock market."
        )
    elif "crypto" in msg_lower or "bitcoin" in msg_lower or "doge" in msg_lower:
        return (
            "Cryptocurrency (like Bitcoin or Ethereum) is highly volatile. While it offers high potential returns, it carries extreme risk. "
            "Prices can drop 50% in a single day.\n\n"
            "As a student, you should treat crypto as speculation, not secure investing. If you want to experiment, only use money you are "
            "100% prepared to lose entirely (no more than 1% to 5% of your total savings)."
        )
    return (
        "Hello! I am FinSight AI, your personal financial advisor. That's a great question. As a student, the key is to start early, "
        "even with small amounts. \n\n"
        "I suggest starting a monthly Systematic Investment Plan (SIP) in a low-cost index fund (like Nifty 50) and setting up a basic budget. "
        "Would you like to know more about how SIPs work or how to set up an emergency fund?"
    )

async def call_groq_api(message: str, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ],
        "temperature": 0.7,
        "max_tokens": 512
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers, timeout=10.0)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            raise Exception(f"API status {response.status_code}")

@app.route("/chat", methods=["POST"])
def ask_advisor():
    data = request.json or {}
    message = data.get("message", "")
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        return jsonify({"response": generate_local_response(message)})
        
    try:
        reply = asyncio.run(call_groq_api(message, groq_api_key))
        return jsonify({"response": reply})
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return jsonify({"response": f"[AI service offline, loading local fallback] {generate_local_response(message)}"})

# Run Flask server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
