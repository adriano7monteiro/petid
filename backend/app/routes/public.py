from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from bson import ObjectId
from app.core.db import get_db

router = APIRouter(prefix="/public", tags=["public"])

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Carteirinha PetID</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body{{font-family: Arial, Helvetica, sans-serif; background:#f7fafc; color:#1f2937; margin:0}}
    .wrap{{max-width:880px;margin:24px auto;padding:0 16px}}
    .card{{background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,.06); padding:20px}}
    .grid{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}}
    .item{{background:#fff;border:1px solid #eee;border-radius:12px;padding:12px}}
    .title{{font-size:24px;font-weight:700;margin:0 0 8px}}
    .subtitle{{color:#6b7280;margin:0 0 16px}}
    .section{{font-weight:700;margin:16px 0 8px}}
    .timeline{{list-style:none;padding:0;margin:0}}
    .timeline li{{padding:10px 12px;border:1px solid #eee;border-radius:12px;margin-bottom:8px}}
    .badge{{display:inline-block;background:#e5edff;color:#1e3a8a;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:600}}
    .btn{{display:inline-block;background:#2563eb;color:#fff;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700}}
    @media (max-width:720px){{.grid{{grid-template-columns:1fr}}}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1 class="title">Carteirinha Digital – PetID</h1>
      <p class="subtitle">Resumo público do pet (sem login) para uso clínico.</p>
      <div class="grid">
        <div class="item">
          <div class="section">Dados do Pet</div>
          <div><b>Nome:</b> {name}</div>
          <div><b>Espécie:</b> {species} &nbsp; <b>Raça:</b> {breed}</div>
          <div><b>Idade:</b> {age} &nbsp; <b>Peso:</b> {weight}</div>
          <div><b>Alergias:</b> {allergies}</div>
          <div style="color:#6b7280;margin-top:6px">ID: {pet_id}</div>
        </div>
        <div class="item">
          <div class="section">Visão Geral</div>
          <div class="badge">Entradas do diário: {entries_count}</div>
          <div class="badge">Período: {period_text}</div>
          <canvas id="chart" height="160"></canvas>
        </div>
      </div>
      <div class="section">Últimos registros do Diário</div>
      <ul class="timeline">{timeline_html}</ul>
      <div style="margin-top:12px">
        <a class="btn" href="{pdf_url}" target="_blank" rel="noopener">Baixar relatório completo (PDF)</a>
      </div>
    </div>
  </div>
  <script>
    const labels = {labels_json};
    const values = {values_json};
    if (labels.length) {{
      const ctx = document.getElementById('chart').getContext('2d');
      new Chart(ctx, {{
        type: 'line',
        data: {{ labels: labels, datasets: [{{ label: 'Índice (apetite+energia)', data: values, tension: 0.25 }}] }},
        options: {{ plugins: {{ legend: {{ display: false }} }}, scales: {{ y: {{ suggestedMin: 0, suggestedMax: 3, ticks: {{ stepSize: 1 }} }} }} }}
      }});
    }}
  </script>
</body>
</html>"""

def score(v: str) -> int:
    if v == "high": return 3
    if v == "mid": return 2
    if v == "low": return 1
    return 0

@router.get("/pet/{pet_id}", response_class=HTMLResponse)
async def public_pet_card(pet_id: str):
    db = get_db()
    pet = None
    if ObjectId.is_valid(pet_id):
        pet = await db.pets.find_one({"_id": ObjectId(pet_id)})
    # Load diary
    q = {"pet_id": ObjectId(pet_id)} if ObjectId.is_valid(pet_id) else {"pet_id": pet_id}
    entries = []
    cursor = db.diary.find(q).sort("date", 1)
    async for d in cursor:
        entries.append(d)

    if not pet:
        html = HTML_TEMPLATE.format(
            name="Pet", species="—", breed="—", age="—", weight="—", allergies="—",
            pet_id=pet_id, entries_count=len(entries),
            period_text="—",
            labels_json="[]", values_json="[]",
            timeline_html="<li>Nenhum registro encontrado.</li>",
            pdf_url=f"/api/reports/diary/{pet_id}"
        )
        return HTMLResponse(content=html)

    # build chart + timeline
    labels, values, timeline = [], [], []
    for e in entries:
        dt = e.get("date")
        try:
            dt_str = dt.strftime("%d/%m/%Y %H:%M")
        except Exception:
            dt_str = str(dt)
        ap, en = e.get("appetite","?"), e.get("energy","?")
        med = "Sim" if e.get("medication") else "Não"
        labels.append(dt_str)
        values.append((score(ap)+score(en))/2 if isinstance(ap, str) and isinstance(en, str) else 0)
        notes = e.get("notes") or ""
        notes_html = f"<div style='color:#6b7280'>Obs: {notes}</div>" if notes else ""
        timeline.append(f"<li><b>{dt_str}</b> — Apetite: {ap} • Energia: {en} • Medicação: {med}{notes_html}</li>")

    if entries:
        first, last = entries[0].get("date"), entries[-1].get("date")
        try:
            period_text = f"{first.strftime('%d/%m/%Y')} – {last.strftime('%d/%m/%Y')}"
        except Exception:
            period_text = "—"
    else:
        period_text = "—"

    html = HTML_TEMPLATE.format(
        name=pet.get("name","—"),
        species=pet.get("species","—"),
        breed=pet.get("breed","—"),
        age=str(pet.get("age","—")),
        weight=str(pet.get("weight","—")),
        allergies=pet.get("allergies","—"),
        pet_id=str(pet.get("_id")),
        entries_count=len(entries),
        period_text=period_text,
        labels_json=str(labels).replace("'", '"'),
        values_json=str(values),
        timeline_html="".join(timeline[-30:]) if timeline else "<li>Nenhum registro encontrado.</li>",
        pdf_url=f"/api/reports/diary/{pet_id}",
    )
    return HTMLResponse(content=html)