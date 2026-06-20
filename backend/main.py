from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    SECRET_KEY: str = ""
    DATABASE_URL: str = ""
    UPLOAD_DIR: str = ""
    BIAS_CHECK_DIR_THRESHOLD: float = 0.80
    REGISTRATION_VALIDITY_DAYS: int = 365
    EXPLAINABILITY_ARTIFACT_MAX_AGE_DAYS: int = 90
    REREGISTRATION_WARNING_DAYS: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

from routers import auth, submission, registry, notifications, audit, bias, public_registry

app = FastAPI(title="Maliba AI Governance Platform API")

app.include_router(auth.router)
app.include_router(submission.router)
app.include_router(registry.router)
app.include_router(notifications.router)
app.include_router(audit.router)
app.include_router(bias.router)
app.include_router(public_registry.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}
