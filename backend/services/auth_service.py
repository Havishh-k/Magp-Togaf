import uuid
from datetime import datetime, timedelta, UTC
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from models.user import User
from schemas.auth import UserCreate
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "maliba_secret_key"
    ALGORITHM: str = "HS256"

settings = Settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480 # 8 hours

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        id=uuid.uuid4().hex,
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        organization=user.organization
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
