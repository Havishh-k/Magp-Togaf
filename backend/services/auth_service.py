import uuid
from datetime import datetime, timedelta, UTC
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from models.user import User
from schemas.auth import UserCreate, UserUpdate, PasswordUpdate
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
        organization=user.organization,
        is_approved=(user.role != "vendor")
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: str, update_data: UserUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if update_data.email and update_data.email != user.email:
        existing_email = db.query(User).filter(User.email == update_data.email).first()
        if existing_email:
            raise ValueError("Email already registered")
        user.email = update_data.email
        
    if update_data.organization is not None:
        user.organization = update_data.organization
        
    db.commit()
    db.refresh(user)
    return user

def update_password(db: Session, user_id: str, password_data: PasswordUpdate):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
        
    if not verify_password(password_data.current_password, user.password_hash):
        raise ValueError("Incorrect current password")
        
    user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
