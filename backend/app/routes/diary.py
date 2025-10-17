from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import List
from bson import ObjectId
from app.models.schemas import DiaryEntryIn, DiaryEntryOut
from app.core.db import get_db
from app.core.config import get_settings
from jose import jwt, JWTError

router = APIRouter(prefix="/diary", tags=["diary"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
settings = get_settings()

def get_user_id_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def normalize_entry(doc) -> DiaryEntryOut:
    return {
        "id": str(doc["_id"]),
        "pet_id": str(doc["pet_id"]),
        "date": doc["date"],
        "appetite": doc["appetite"],
        "energy": doc["energy"],
        "symptom_photo": doc.get("symptom_photo"),
        "medication": doc.get("medication", False),
        "notes": doc.get("notes"),
    }

@router.post("", response_model=DiaryEntryOut)
async def add_entry(payload: DiaryEntryIn, token: str = Depends(oauth2_scheme)):
    db = get_db()
    _ = get_user_id_from_token(token)
    doc = payload.dict()
    doc["pet_id"] = ObjectId(payload.pet_id) if ObjectId.is_valid(payload.pet_id) else payload.pet_id
    res = await db.diary.insert_one(doc)
    created = await db.diary.find_one({"_id": res.inserted_id})
    return normalize_entry(created)

@router.get("/{pet_id}", response_model=List[DiaryEntryOut])
async def get_entries(pet_id: str, token: str = Depends(oauth2_scheme)):
    db = get_db()
    _ = get_user_id_from_token(token)
    q = {"pet_id": ObjectId(pet_id)} if ObjectId.is_valid(pet_id) else {"pet_id": pet_id}
    cursor = db.diary.find(q).sort("date", 1)
    items = []
    async for d in cursor:
        items.append(normalize_entry(d))
    return items