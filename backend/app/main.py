import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import jira, testcases

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Jira Test Case Generator API",
    description="Generate test cases from Jira user stories using Groq LLM",
    version="1.0.0"
)

origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jira.router)
app.include_router(testcases.router)


@app.get("/")
async def root():
    return {"message": "Jira Test Case Generator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "groq_configured": bool(os.environ.get("GROQ_API_KEY"))}