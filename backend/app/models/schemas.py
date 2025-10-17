from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: str
    email: EmailStr

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PetIn(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    allergies: Optional[str] = None

class PetOut(PetIn):
    id: str
    owner_id: str

class DiaryEntryIn(BaseModel):
    pet_id: str
    date: datetime
    appetite: str
    energy: str
    symptom_photo: Optional[str] = None
    medication: bool = False
    notes: Optional[str] = None

class DiaryEntryOut(DiaryEntryIn):
    id: str