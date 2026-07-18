from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth_utils

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=schemas.AuthResponse)
def signup(payload: schemas.UserSignup, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Hash password & create user
    hashed_pwd = auth_utils.get_password_hash(payload.password)
    new_user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = auth_utils.create_access_token(new_user.id)
    
    return {"token": token, "user": new_user}

@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth_utils.verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    # Generate token
    token = auth_utils.create_access_token(user.id)
    
    return {"token": token, "user": user}

@router.get("/me", response_model=schemas.AuthResponse)
def get_me(current_user: models.User = Depends(auth_utils.get_current_user)):
    # Frontend expects { token, user } or just user.
    # App.jsx:
    # const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
    # const me = await meRes.json()
    # setCurrentUser(me.user)
    # We should return { token: "dummy_or_current_token", user: current_user }
    # Let's regenerate a token or pass empty since the token is already in localstorage
    token = auth_utils.create_access_token(current_user.id)
    return {"token": token, "user": current_user}
