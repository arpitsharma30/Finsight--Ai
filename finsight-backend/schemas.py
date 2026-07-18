from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True

class AuthResponse(BaseModel):
    token: str
    user: UserOut


# --- Profile & Goals Schemas ---
class ProfileCreate(BaseModel):
    age: int
    monthly_savings: float
    income: float
    loss_reaction: int
    goal: str
    horizon: str
    experience: str

class ProfileOut(BaseModel):
    id: int
    user_id: int
    age: int
    monthly_savings: float
    income: float
    loss_reaction: int
    goal: str
    horizon: str
    experience: str
    risk_level: str

    class Config:
        orm_mode = True


class GoalCreate(BaseModel):
    title: str
    target_amount: float
    target_date: str
    monthly_contribution: float

class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    target_date: str
    monthly_contribution: float
    created_at: datetime

    class Config:
        orm_mode = True


# --- Portfolio & Transaction Schemas ---
class TransactionCreate(BaseModel):
    symbol: str
    name: str
    qty: float
    buy_price: float
    exchange: Optional[str] = "NSE"

class HoldingOut(BaseModel):
    symbol: str
    name: str
    qty: float
    buy_price: float
    current_price: float
    gain_pct: float
    value: float
    allocation: float

class PortfolioResponse(BaseModel):
    total_value: float
    total_gain: float
    gain_pct: float
    holdings: List[HoldingOut]


class DashboardResponse(BaseModel):
    profile: Optional[ProfileOut] = None
    portfolio: Optional[PortfolioResponse] = None


# --- Stock Schemas ---
class StockOut(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    exchange: str

class StockListResponse(BaseModel):
    stocks: List[StockOut]


# --- Quiz Schemas ---
class QuizQuestionOut(BaseModel):
    question: str
    options: List[str]
    correct: int
    explanation: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestionOut]

class QuizRequest(BaseModel):
    topic: str


# --- Chat Schemas ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
