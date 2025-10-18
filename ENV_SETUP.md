# 🔐 Configuração de Variáveis de Ambiente

Este projeto usa variáveis de ambiente para configurar credenciais e chaves de API. Siga as instruções abaixo para configurar corretamente.

## 📋 Backend

1. **Copie o arquivo de exemplo:**
   ```bash
   cd petid-backend
   cp .env.example .env
   ```

2. **Edite o arquivo `.env` e configure:**

   - **MongoDB**: Se usar local, mantenha como está. Se usar MongoDB Atlas, altere para sua connection string
   - **JWT_SECRET**: Gere uma chave segura (mínimo 32 caracteres)
   - **OPENAI_API_KEY**: Adicione sua chave da OpenAI
     - Obtenha em: https://platform.openai.com/api-keys
     - Formato: `sk-proj-...`

   Exemplo:
   ```env
   MONGO_URI=mongodb://localhost:27017/
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui_32_chars_ou_mais
   OPENAI_API_KEY=sk-proj-sua_chave_openai_real_aqui
   ```

## 📱 Frontend

1. **Copie o arquivo de exemplo:**
   ```bash
   cd petid-app
   cp .env.example .env
   ```

2. **Edite o arquivo `.env` com a URL do backend:**

   - **Para desenvolvimento local:**
     ```env
     REACT_APP_API_URL=http://localhost:8001/api
     ```

   - **Para usar backend remoto:**
     ```env
     REACT_APP_API_URL=https://sua-url-preview.emergentagent.com/api
     ```

   - **Para testar no celular via rede local:**
     ```env
     REACT_APP_API_URL=http://192.168.1.X:8001/api
     ```
     (Substitua X pelo IP da sua máquina)

## ⚠️ Segurança

**NUNCA** commite arquivos `.env` com chaves reais para o repositório!

- ✅ Os arquivos `.env` estão no `.gitignore`
- ✅ Use `.env.example` como modelo
- ✅ Cada desenvolvedor deve ter seu próprio `.env` local

## 🚀 Iniciar o Projeto

Após configurar os arquivos `.env`:

```bash
# Backend
cd petid-backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd petid-app
yarn install
npx expo start --clear
```

## 💡 Dicas

- Use variáveis de ambiente diferentes para desenvolvimento e produção
- Mantenha backups das suas chaves em local seguro
- Revogue chaves se forem expostas acidentalmente
- Para OpenAI, você pode configurar limites de uso no dashboard
