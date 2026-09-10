import os

class Settings:
    PROJECT_NAME: str = "QueryHub — DBMS AI-Powered Learning Portal & SQL Virtual Lab"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api"
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lms.db")
    
    # Groq API Configuration (Free Tier Qwen 2.5 / 3.2 Models)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen-2.5-32b")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

    # Ollama & Qwen 2.5 7B Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
    
    # Security & Storage
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-trainer-jwt-key-2026")
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # local or s3
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
