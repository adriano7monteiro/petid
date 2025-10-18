#!/bin/bash

echo "🔧 PetID - Setup de Variáveis de Ambiente"
echo "=========================================="
echo ""

# Backend
echo "📦 Configurando Backend..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Arquivo backend/.env criado"
    echo "⚠️  ATENÇÃO: Edite backend/.env e adicione:"
    echo "   - Sua chave OpenAI (OPENAI_API_KEY)"
    echo "   - Um JWT_SECRET seguro"
else
    echo "ℹ️  backend/.env já existe"
fi

echo ""

# Frontend
echo "📱 Configurando Frontend..."
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Arquivo frontend/.env criado"
    echo "ℹ️  Configure a URL do backend se necessário"
else
    echo "ℹ️  frontend/.env já existe"
fi

echo ""
echo "=========================================="
echo "✅ Setup concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Edite backend/.env com suas chaves"
echo "2. Edite frontend/.env com a URL do backend"
echo "3. Leia ENV_SETUP.md para mais detalhes"
echo ""
