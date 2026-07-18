from fastapi import APIRouter, HTTPException
import os
import httpx
import logging
import schemas

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/chat", tags=["AI Advisor"])

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

@router.post("", response_model=schemas.ChatResponse)
async def ask_advisor(payload: schemas.ChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    if not groq_api_key:
        # Fallback to local response generator
        response_text = generate_local_response(payload.message)
        return {"response": response_text}
        
    # Hit the Groq Chat API using httpx
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": payload.message}
        ],
        "temperature": 0.7,
        "max_tokens": 512
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=body, headers=headers, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                reply = data["choices"][0]["message"]["content"]
                return {"response": reply}
            else:
                logger.error(f"Groq API returned status {response.status_code}: {response.text}")
                raise HTTPException(status_code=502, detail="Failed to retrieve response from AI service.")
    except Exception as e:
        logger.error(f"Groq API call error: {e}")
        # Soft fallback if request fails
        response_text = generate_local_response(payload.message)
        return {"response": f"[AI service offline, loading local fallback] {response_text}"}
