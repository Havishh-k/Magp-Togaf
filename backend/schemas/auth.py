from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str
    organization: str | None = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    organization: str | None

    class Config:
        from_attributes = True
