from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter()

# Inicializar cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class HealthCheckRequest(BaseModel):
    eating_normally: str  # "yes", "no", "maybe"
    energy_level: str     # "yes", "no", "maybe"
    vomit_diarrhea: str   # "yes", "no", "maybe"
    pain_signs: str       # "yes", "no", "maybe"
    pet_name: str = "seu pet"
    pet_species: str = "animal"
    additional_info: str = ""

@router.post("/ai-diagnosis")
async def ai_diagnosis(request: HealthCheckRequest):
    """
    Gera diagnóstico veterinário usando OpenAI GPT-4
    """
    try:
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
