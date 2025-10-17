from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from io import BytesIO
from datetime import datetime
from bson import ObjectId
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from app.core.db import get_db
from app.core.config import get_settings
from jose import jwt, JWTError

router = APIRouter(prefix="/reports", tags=["reports"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
settings = get_settings()

def get_user_id_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/diary/{pet_id}")
async def diary_report(pet_id: str, token: str = Depends(oauth2_scheme)):
    db = get_db()
    _ = get_user_id_from_token(token)
    q = {"pet_id": ObjectId(pet_id)} if ObjectId.is_valid(pet_id) else {"pet_id": pet_id}
    pet = await db.pets.find_one({"_id": ObjectId(pet_id)}) if ObjectId.is_valid(pet_id) else None
    entries = []
    cursor = db.diary.find(q).sort("date", 1)
    async for d in cursor:
        entries.append(d)
    if not entries:
        raise HTTPException(status_code=404, detail="Sem entradas de diário para este pet.")

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4

    title = f"Relatório de Recuperação - {pet.get('name') if pet else 'Pet'}"
    c.setFont("Helvetica-Bold", 16)
    c.drawString(2*cm, h-2*cm, title)
    c.setFont("Helvetica", 10)
    c.drawString(2*cm, h-2.6*cm, f"Gerado em: {datetime.utcnow().strftime('%d/%m/%Y %H:%M UTC')}")
    c.line(2*cm, h-2.8*cm, w-2*cm, h-2.8*cm)

    y = h-3.5*cm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(2*cm, y, "Entradas:")
    y -= 0.5*cm
    c.setFont("Helvetica", 10)
    for e in entries:
        try:
            dt = e["date"].strftime("%d/%m/%Y %H:%M")
        except Exception:
            dt = str(e["date"])
        line = f"- {dt} | Apetite: {e.get('appetite','?')} | Energia: {e.get('energy','?')} | Medicação: {'Sim' if e.get('medication') else 'Não'}"
        if y < 3*cm:
            c.showPage(); y = h-2*cm
        c.drawString(2*cm, y, line); y -= 0.5*cm
        notes = e.get("notes")
        if notes:
            for i in range(0, len(notes), 90):
                chunk = notes[i:i+90]
                if y < 3*cm: c.showPage(); y = h-2*cm
                c.drawString(3*cm, y, f"Obs: {chunk}"); y -= 0.5*cm

    c.showPage(); c.save(); buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf", headers={
        "Content-Disposition": f'inline; filename="relatorio_diario_{pet_id}.pdf"'
    })