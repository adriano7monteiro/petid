# PetID – Backend (FastAPI + MongoDB + JWT + Upload + Público)
- Auth JWT (register/login)
- Pets (criar/listar)
- Diário (adicionar/listar)
- Upload de imagem (serviço /static)
- Relatório PDF do Diário
- Página pública do pet com gráfico (sem login)

## Rodar
cp .env.example .env  # edite MONGO_URI e JWT_SECRET
pip install -r requirements.txt
uvicorn app.main:app --reload