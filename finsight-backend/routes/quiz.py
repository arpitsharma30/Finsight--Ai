from fastapi import APIRouter
import schemas

router = APIRouter(prefix="/quiz", tags=["Quiz"])

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
            "explanation": "A mutual fund pools money from multiple investors and invests in a diversified portfolio of stocks, bonds, or other securities managed by professionals."
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

@router.post("", response_model=schemas.QuizResponse)
def get_quiz(payload: schemas.QuizRequest):
    topic = payload.topic.lower().strip()
    
    # Return matched quiz questions or default to finance basics
    questions = QUIZ_BANK.get(topic, QUIZ_BANK["finance basics"])
    return {"questions": questions}
