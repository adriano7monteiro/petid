from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from .config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

def create_access_token(sub: str, expires_minutes: int | None = None) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": sub}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)