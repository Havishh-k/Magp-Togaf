from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import verify_password, get_user, create_access_token, create_user, ACCESS_TOKEN_EXPIRE_MINUTES, update_user_profile, update_password
from schemas.auth import Token, UserResponse, UserCreate, UserUpdate, PasswordUpdate
from datetime import timedelta
from jose import jwt, JWTError
from services.auth_service import settings
from services.audit_service import append_audit_entry
from typing import List

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["ministry", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return current_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending administrative approval"
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_me(update_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated_user = update_user_profile(db, current_user.id, update_data)
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/me/password")
def change_password(password_data: PasswordUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        update_password(db, current_user.id, password_data)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/vendors/pending", response_model=List[UserResponse])
def get_pending_vendors(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vendors = db.query(User).filter(User.is_approved == False, User.role == "vendor").all()
    return vendors

@router.post("/vendors/{user_id}/approve", response_model=UserResponse)
def approve_vendor(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vendor = db.query(User).filter(User.id == user_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.is_approved = True
    db.commit()
    db.refresh(vendor)
    append_audit_entry(db, "VENDOR_APPROVED", {"vendor_id": vendor.id, "vendor_name": vendor.username}, "MINISTRY", "SYSTEM", current_user.id)
    return vendor

@router.delete("/vendors/{user_id}")
def reject_vendor(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    vendor = db.query(User).filter(User.id == user_id, User.is_approved == False).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Pending vendor not found")
    db.delete(vendor)
    db.commit()
    return {"status": "deleted"}
