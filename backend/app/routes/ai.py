from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from app.core.config import get_settings

router = APIRouter()

# Função para obter cliente OpenAI (lazy initialization)
def get_openai_client():
    settings = get_settings()
    api_key = settings.OPENAI_API_KEY
    
    if not api_key or api_key == "":
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY não configurada. Configure no arquivo .env"
        )
    return OpenAI(api_key=api_key)

class HealthCheckRequest(BaseModel):
    eating_normally: str  # "yes", "no", "maybe"
    energy_level: str     # "yes", "no", "maybe"
    vomit_diarrhea: str   # "yes", "no", "maybe"
    pain_signs: str       # "yes", "no", "maybe"
    pet_name: str = "seu pet"
    pet_species: str = "animal"
    additional_info: str = ""

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    pet_name: str = "seu pet"
    pet_species: str = "animal"
    messages: list[ChatMessage]  # Histórico da conversa
    new_message: str  # Nova pergunta do usuário

@router.post("/ai-diagnosis")
async def ai_diagnosis(request: HealthCheckRequest):
    """
    Gera diagnóstico veterinário usando OpenAI GPT-4
    """
    try:
        # Obter cliente OpenAI
        client = get_openai_client()
        
        # Construir prompt detalhado
        symptoms = []
        
        if request.eating_normally == "no":
            symptoms.append("não está comendo")
        elif request.eating_normally == "maybe":
            symptoms.append("está comendo menos que o normal")
        
        if request.energy_level == "yes":
            symptoms.append("está mais quieto/apático que o normal")
        elif request.energy_level == "maybe":
            symptoms.append("apresenta leve redução de energia")
            
        if request.vomit_diarrhea == "yes":
            symptoms.append("teve vômito ou diarreia nas últimas 24h")
        elif request.vomit_diarrhea == "maybe":
            symptoms.append("teve leve desconforto gastrointestinal")
            
        if request.pain_signs == "yes":
            symptoms.append("apresenta sinais de dor (mancar, sensibilidade, gemido)")
        elif request.pain_signs == "maybe":
            symptoms.append("apresenta desconforto leve")
        
        symptoms_text = ", ".join(symptoms) if symptoms else "nenhum sintoma significativo"
        
        prompt = f"""Você é um assistente veterinário experiente. Analise os seguintes sintomas de {request.pet_name} ({request.pet_species}):

Sintomas relatados: {symptoms_text}

{f"Informações adicionais: {request.additional_info}" if request.additional_info else ""}

Por favor, forneça:
1. Uma avaliação do nível de urgência (Baixo, Médio ou Alto)
2. Possíveis causas dos sintomas
3. Recomendações de cuidados
4. Quando procurar um veterinário

Seja claro, objetivo e empático. Sempre lembre que este é um guia inicial e não substitui consulta veterinária presencial."""

        # Chamar OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "Você é um assistente veterinário virtual que ajuda tutores a avaliar a saúde de seus pets. Seja claro, empático e sempre recomende cuidado veterinário quando apropriado."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        diagnosis = response.choices[0].message.content
        
        return {
            "success": True,
            "diagnosis": diagnosis,
            "symptoms_analyzed": symptoms_text
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar diagnóstico: {str(e)}"
        )


@router.post("/ai-chat")
async def ai_chat(request: ChatRequest):
    """
    Endpoint de chat interativo para diagnóstico veterinário.
    Mantém contexto da conversa e permite perguntas de follow-up.
    """
    try:
        # Obter cliente OpenAI
        client = get_openai_client()
        
        # Construir mensagens para o modelo
        messages = [
            {
                "role": "system",
                "content": f"Você é um assistente veterinário virtual especializado que está ajudando o tutor de {request.pet_name}, um(a) {request.pet_species}. Seja claro, empático e sempre recomende cuidado veterinário presencial quando apropriado. Responda de forma concisa e objetiva."
            }
        ]
        
        # Adicionar histórico de conversa
        for msg in request.messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Adicionar nova mensagem do usuário
        messages.append({
            "role": "user",
            "content": request.new_message
        })
        
        # Chamar OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=600
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            "success": True,
            "response": ai_response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar chat: {str(e)}"
        )
