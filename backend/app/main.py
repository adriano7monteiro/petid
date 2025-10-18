from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.routes import auth, pets, diary, upload, reports, public, ai

settings = get_settings()
app = FastAPI(title="PetID API", version="1.0.0")

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

@app.get("/")
def root():
    return {"status": "ok", "name": "PetID API"}

@app.get("/api")
def api_root():
    return {"status": "ok", "name": "PetID API"}

app.include_router(auth.router, prefix="/api")
app.include_router(pets.router, prefix="/api")
app.include_router(diary.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(public.router)  # Mantém também sem /api para compatibilidade