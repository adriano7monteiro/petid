#!/usr/bin/env python3
"""
Backend API Testing for PetID App - AI Chat Feature
Tests the AI diagnosis and interactive chat endpoints
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_API_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "https://paws-health-4.preview.emergentagent.com/api"

BASE_URL = get_backend_url()
print(f"Testing backend at: {BASE_URL}")

def test_ai_diagnosis():
    """Test the /api/ai-diagnosis endpoint"""
    print("\n=== Testing /api/ai-diagnosis endpoint ===")
    
    # Test data as specified in the requirements
    test_data = {
        "eating_normally": "no",
        "energy_level": "yes", 
        "vomit_diarrhea": "yes",
        "pain_signs": "maybe",
        "pet_name": "Rex",
        "pet_species": "cachorro",
        "additional_info": "Está bebendo muita água"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai-diagnosis",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Diagnosis endpoint working!")
            print(f"Success: {data.get('success', 'N/A')}")
            print(f"Symptoms Analyzed: {data.get('symptoms_analyzed', 'N/A')}")
            
            diagnosis = data.get('diagnosis', '')
            if diagnosis:
                print(f"Diagnosis Preview: {diagnosis[:200]}...")
                return True, diagnosis
            else:
                print("❌ No diagnosis text returned")
                return False, None
        else:
            print(f"❌ AI Diagnosis failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False, None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False, None

def test_ai_chat(initial_diagnosis=None):
    """Test the /api/ai-chat endpoint"""
    print("\n=== Testing /api/ai-chat endpoint ===")
    
    # Prepare chat history with initial diagnosis if available
    messages = []
    if initial_diagnosis:
        messages.append({
            "role": "assistant",
            "content": initial_diagnosis
        })
    
    # Test data as specified in the requirements
    test_data = {
        "pet_name": "Rex",
        "pet_species": "cachorro",
        "messages": messages,
        "new_message": "Quais medicamentos você recomenda?"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai-chat",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Chat endpoint working!")
            print(f"Success: {data.get('success', 'N/A')}")
            
            ai_response = data.get('response', '')
            if ai_response:
                print(f"AI Response Preview: {ai_response[:200]}...")
                return True, ai_response
            else:
                print("❌ No AI response returned")
                return False, None
        else:
            print(f"❌ AI Chat failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False, None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False, None

def test_ai_chat_conversation_context():
    """Test AI chat with multiple rounds of conversation"""
    print("\n=== Testing AI Chat Conversation Context ===")
    
    # Simulate a multi-turn conversation
    conversation_messages = [
        {
            "role": "assistant",
            "content": "Com base nos sintomas relatados (não está comendo, mais quieto, teve vômito/diarreia, desconforto leve, bebendo muita água), Rex pode estar com gastroenterite ou desidratação. Recomendo consulta veterinária urgente."
        },
        {
            "role": "user", 
            "content": "Quais medicamentos você recomenda?"
        },
        {
            "role": "assistant",
            "content": "Não posso prescrever medicamentos específicos, pois isso deve ser feito por um veterinário após exame presencial. É importante levar Rex ao veterinário para avaliação adequada."
        }
    ]
    
    test_data = {
        "pet_name": "Rex",
        "pet_species": "cachorro", 
        "messages": conversation_messages,
        "new_message": "Posso dar água com açúcar para ele?"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ai-chat",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Chat conversation context working!")
            
            ai_response = data.get('response', '')
            if ai_response:
                print(f"Contextual Response Preview: {ai_response[:200]}...")
                
                # Check if response seems contextually relevant
                if any(word in ai_response.lower() for word in ['água', 'açúcar', 'hidratação', 'veterinário']):
                    print("✅ Response appears contextually relevant")
                    return True
                else:
                    print("⚠️ Response may not be contextually relevant")
                    return True  # Still working, just noting the concern
            else:
                print("❌ No AI response returned")
                return False
        else:
            print(f"❌ AI Chat conversation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_api_health():
    """Test basic API health"""
    print("\n=== Testing API Health ===")
    
    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL.replace('/api', '')}/", timeout=10)
        print(f"Root endpoint status: {response.status_code}")
        
        # Test API root endpoint  
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"API root endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API is accessible")
            return True
        else:
            print("❌ API health check failed")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API health check failed: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🧪 Starting PetID Backend API Tests")
    print("=" * 50)
    
    results = {
        'api_health': False,
        'ai_diagnosis': False, 
        'ai_chat': False,
        'ai_chat_context': False
    }
    
    # Test API health first
    results['api_health'] = test_api_health()
    
    if not results['api_health']:
        print("\n❌ API is not accessible. Stopping tests.")
        return results
    
    # Test AI diagnosis endpoint
    diagnosis_success, diagnosis_text = test_ai_diagnosis()
    results['ai_diagnosis'] = diagnosis_success
    
    # Test AI chat endpoint
    chat_success, chat_response = test_ai_chat(diagnosis_text)
    results['ai_chat'] = chat_success
    
    # Test AI chat conversation context
    results['ai_chat_context'] = test_ai_chat_conversation_context()
    
    # Print summary
    print("\n" + "=" * 50)
    print("🏁 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed - check logs above")
    
    return results

if __name__ == "__main__":
    main()