import os
from datetime import datetime, timedelta
from typing import Union, Any
import hashlib
import secrets
import jwt
from flask import request
import models

# OpenSSL-generated secret key fallback
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "70c8df4f59cfb6fa91176b65ee7a89270e5b7b9f55e09f583e735e0767c29302")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def get_password_hash(password: str) -> str:
    """
    Generate a secure password hash using PBKDF2-SHA256 from Python's standard library.
    Requires no external binaries, ensuring compatibility on Python 3.14.
    """
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password using constant-time comparison against PBKDF2 hash.
    """
    try:
        salt, key_hex = hashed_password.split('$')
        key = hashlib.pbkdf2_hmac(
            'sha256', 
            plain_password.encode('utf-8'), 
            salt.encode('utf-8'), 
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_from_request(db) -> models.User:
    """
    Retrieves the current authenticated user from the Flask request headers.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        return user
    except Exception:
        return None
