from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pathlib import Path
import uuid
from app.core.config import get_settings

router = APIRouter(prefix="/upload", tags=["upload"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
settings = get_settings()

@router.post("")
async def upload_image(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="Formato não suportado")
    uid = f"{uuid.uuid4().hex}{suffix}"
    dest_dir = Path(settings.UPLOAD_DIR); dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / uid
    content = await file.read()
    with open(dest, "wb") as f:
        f.write(content)
    return {"path": f"/static/{uid}"}