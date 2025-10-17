from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.schemas import UserCreate, TokenOut, UserPublic
from app.core.db import get_db
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserPublic)
async def register(payload: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    doc = {"email": payload.email, "password": hash_password(payload.password)}
    res = await db.users.insert_one(doc)
    return {"id": str(res.inserted_id), "email": payload.email}

@router.post("/login", response_model=TokenOut)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}