from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth_utils
from stock_utils import fetch_stock_price

router = APIRouter(prefix="/user", tags=["User Actions"])

def get_risk_level(loss_reaction: int) -> str:
    if loss_reaction == 1:
        return "Conservative"
    elif loss_reaction == 2:
        return "Moderate"
    elif loss_reaction == 3:
        return "Aggressive"
    return "Moderate"

def get_profile_out(profile: models.Profile) -> schemas.ProfileOut:
    return schemas.ProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        age=profile.age,
        monthly_savings=profile.monthly_savings,
        income=profile.income,
        loss_reaction=profile.loss_reaction,
        goal=profile.goal,
        horizon=profile.horizon,
        experience=profile.experience,
        risk_level=get_risk_level(profile.loss_reaction)
    )

@router.get("/profile")
def read_profile(current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if not profile:
        return {"profile": None}
    return {"profile": get_profile_out(profile)}

@router.post("/profile", response_model=schemas.ProfileOut)
def create_or_update_profile(payload: schemas.ProfileCreate, current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile:
        profile.age = payload.age
        profile.monthly_savings = payload.monthly_savings
        profile.income = payload.income
        profile.loss_reaction = payload.loss_reaction
        profile.goal = payload.goal
        profile.horizon = payload.horizon
        profile.experience = payload.experience
    else:
        profile = models.Profile(
            user_id=current_user.id,
            age=payload.age,
            monthly_savings=payload.monthly_savings,
            income=payload.income,
            loss_reaction=payload.loss_reaction,
            goal=payload.goal,
            horizon=payload.horizon,
            experience=payload.experience
        )
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return get_profile_out(profile)

@router.post("/goals", response_model=schemas.GoalOut)
def create_goal(payload: schemas.GoalCreate, current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    # Check if a goal with this title already exists for the user
    goal = db.query(models.Goal).filter(models.Goal.user_id == current_user.id, models.Goal.title == payload.title).first()
    if goal:
        goal.target_amount = payload.target_amount
        goal.target_date = payload.target_date
        goal.monthly_contribution = payload.monthly_contribution
    else:
        goal = models.Goal(
            user_id=current_user.id,
            title=payload.title,
            target_amount=payload.target_amount,
            target_date=payload.target_date,
            monthly_contribution=payload.monthly_contribution
        )
        db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.post("/transactions", response_model=schemas.HoldingOut)
async def add_transaction(payload: schemas.TransactionCreate, current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    # Add new transaction/holding or adjust existing holding
    holding = db.query(models.Holding).filter(
        models.Holding.user_id == current_user.id, 
        models.Holding.symbol == payload.symbol.upper()
    ).first()
    
    if holding:
        # Calculate new average buy price & total quantity
        total_cost = (holding.qty * holding.buy_price) + (payload.qty * payload.buy_price)
        total_qty = holding.qty + payload.qty
        holding.buy_price = round(total_cost / total_qty, 2)
        holding.qty = total_qty
    else:
        holding = models.Holding(
            user_id=current_user.id,
            symbol=payload.symbol.upper(),
            name=payload.name,
            qty=payload.qty,
            buy_price=payload.buy_price,
            exchange=payload.exchange
        )
        db.add(holding)
        
    db.commit()
    db.refresh(holding)
    
    # Calculate live valuation for output
    live_stock = await fetch_stock_price(holding.symbol)
    current_price = live_stock["price"]
    val = holding.qty * current_price
    gain_pct = ((current_price - holding.buy_price) / holding.buy_price) * 100.0 if holding.buy_price > 0 else 0.0
    
    return schemas.HoldingOut(
        symbol=holding.symbol,
        name=holding.name,
        qty=holding.qty,
        buy_price=holding.buy_price,
        current_price=current_price,
        gain_pct=round(gain_pct, 2),
        value=round(val, 2),
        allocation=100.0  # Placeholder since we don't have total_value here
    )

@router.get("/portfolio", response_model=schemas.PortfolioResponse)
async def get_portfolio(current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    holdings = db.query(models.Holding).filter(models.Holding.user_id == current_user.id).all()
    
    if not holdings:
        return {
            "total_value": 0.0,
            "total_gain": 0.0,
            "gain_pct": 0.0,
            "holdings": []
        }
        
    total_value = 0.0
    total_cost = 0.0
    
    holding_details = []
    
    # Fetch live prices for all holdings
    for h in holdings:
        live_stock = await fetch_stock_price(h.symbol)
        curr_price = live_stock["price"]
        val = h.qty * curr_price
        cost = h.qty * h.buy_price
        
        total_value += val
        total_cost += cost
        
        gain_pct = ((curr_price - h.buy_price) / h.buy_price) * 100.0 if h.buy_price > 0 else 0.0
        
        holding_details.append({
            "symbol": h.symbol,
            "name": h.name,
            "qty": h.qty,
            "buy_price": h.buy_price,
            "current_price": curr_price,
            "gain_pct": round(gain_pct, 2),
            "value": round(val, 2),
            "allocation": 0.0  # Calculated below
        })
        
    # Calculate allocations
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

@router.get("/dashboard")
async def get_dashboard(current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    
    # Calculate portfolio values
    portfolio_res = await get_portfolio(current_user, db)
    
    # Generate custom tips based on risk profile
    ai_tip = "The SIP strategy — investing a fixed amount monthly — reduces market volatility impact through rupee cost averaging."
    if profile:
        risk = get_risk_level(profile.loss_reaction)
        if risk == "Conservative":
            ai_tip = "Given your conservative profile, focus on high-quality debt funds, sovereign gold bonds, and large-cap indexes to preserve your capital."
        elif risk == "Moderate":
            ai_tip = "A diversified 60:40 equity to debt mix matches your moderate risk profile, smoothing out short-term fluctuations."
        elif risk == "Aggressive":
            ai_tip = "Your aggressive stance is suitable for small/midcap equity mutual funds. Stay invested long-term to ride out market volatility."
            
    # Inject AI tip into the portfolio dict as expected by frontend
    portfolio_res["ai_tip"] = ai_tip
            
    return {
        "profile": get_profile_out(profile) if profile else None,
        "portfolio": portfolio_res
    }
