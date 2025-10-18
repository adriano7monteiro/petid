from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from bson import ObjectId
from typing import List
from app.models.schemas import PetIn, PetOut, VaccineData
from app.core.db import get_db
from app.core.config import get_settings

router = APIRouter(prefix="/pets", tags=["pets"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
settings = get_settings()

def get_user_id_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def normalize_pet(doc) -> PetOut:
    # Normalizar vacinas - converter id para string se necessário
    vaccines = doc.get("vaccines", [])
    normalized_vaccines = []
    for vaccine in vaccines:
        if vaccine.get("id") is not None:
            vaccine["id"] = str(vaccine["id"])
        normalized_vaccines.append(vaccine)
    
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "species": doc["species"],
        "breed": doc.get("breed"),
        "age": doc.get("age"),
        "birthdate": doc.get("birthdate"),
        "weight": doc.get("weight"),
        "allergies": doc.get("allergies"),
        "photo": doc.get("photo"),
        "owner_id": str(doc["owner_id"]),
        "vaccines": normalized_vaccines,
    }

@router.post("", response_model=PetOut)
async def create_pet(payload: PetIn, token: str = Depends(oauth2_scheme)):
    db = get_db()
    user_id = get_user_id_from_token(token)
    doc = {**payload.dict(), "owner_id": ObjectId(user_id)}
    res = await db.pets.insert_one(doc)
    created = await db.pets.find_one({"_id": res.inserted_id})
    return normalize_pet(created)

@router.get("", response_model=List[PetOut])
async def list_pets(token: str = Depends(oauth2_scheme)):
    db = get_db()
    user_id = get_user_id_from_token(token)
    cursor = db.pets.find({"owner_id": ObjectId(user_id)})
    items = []
    async for d in cursor:
        items.append(normalize_pet(d))
    return items

@router.put("/{pet_id}/vaccines")
async def update_pet_vaccines(
    pet_id: str, 
    vaccines: List[dict], 
    token: str = Depends(oauth2_scheme)
):
    """Atualiza a lista completa de vacinas do pet"""
    db = get_db()
    user_id = get_user_id_from_token(token)
    
    # Verificar se o pet pertence ao usuário
    pet = await db.pets.find_one({
        "_id": ObjectId(pet_id),
        "owner_id": ObjectId(user_id)
    })
    
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    
    # Atualizar vacinas (já em formato dict)
    await db.pets.update_one(
        {"_id": ObjectId(pet_id)},
        {"$set": {"vaccines": vaccines}}
    )
    
    # Retornar pet atualizado
    updated = await db.pets.find_one({"_id": ObjectId(pet_id)})
    return normalize_pet(updated)

@router.patch("/{pet_id}/vaccines/{vaccine_id}")
async def toggle_vaccine_applied(
    pet_id: str,
    vaccine_id: str,
    applied: bool,
    token: str = Depends(oauth2_scheme)
):
    """Marca ou desmarca uma vacina específica como aplicada"""
    db = get_db()
    user_id = get_user_id_from_token(token)
    
    # Verificar se o pet pertence ao usuário
    pet = await db.pets.find_one({
        "_id": ObjectId(pet_id),
        "owner_id": ObjectId(user_id)
    })
    
    if not pet:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    
    # Atualizar o status da vacina específica
    vaccines = pet.get("vaccines", [])
    for vaccine in vaccines:
        if vaccine.get("id") == vaccine_id:
            vaccine["applied"] = applied
            break
    
    await db.pets.update_one(
        {"_id": ObjectId(pet_id)},
        {"$set": {"vaccines": vaccines}}
    )
    
    updated = await db.pets.find_one({"_id": ObjectId(pet_id)})
    return normalize_pet(updated)