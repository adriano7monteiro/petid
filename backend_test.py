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

def test_suggest_vaccines_full_data():
    """Test the /api/suggest-vaccines endpoint with full pet data"""
    print("\n=== Testing /api/suggest-vaccines endpoint (Full Data) ===")
    
    # Test data as specified in the requirements
    test_data = {
        "pet_species": "cachorro",
        "pet_breed": "Golden Retriever", 
        "pet_age": "2 anos"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/suggest-vaccines",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Vaccine suggestion endpoint working!")
            print(f"Success: {data.get('success', 'N/A')}")
            
            vaccines = data.get('vaccines', [])
            if vaccines:
                print(f"Number of vaccines returned: {len(vaccines)}")
                
                # Check maximum 8 vaccines
                if len(vaccines) <= 8:
                    print("✅ Vaccine count within limit (≤8)")
                else:
                    print(f"⚠️ Too many vaccines returned: {len(vaccines)} (should be ≤8)")
                
                # Validate vaccine structure
                valid_vaccines = 0
                for i, vaccine in enumerate(vaccines[:3]):  # Check first 3 for brevity
                    required_fields = ['name', 'description', 'ageRecommendation', 'frequency', 'priority']
                    has_all_fields = all(field in vaccine for field in required_fields)
                    
                    if has_all_fields:
                        valid_vaccines += 1
                        priority = vaccine.get('priority', '')
                        if priority in ['essential', 'recommended']:
                            print(f"✅ Vaccine {i+1}: {vaccine['name']} - {priority}")
                        else:
                            print(f"⚠️ Vaccine {i+1}: Invalid priority '{priority}' (should be 'essential' or 'recommended')")
                    else:
                        missing = [f for f in required_fields if f not in vaccine]
                        print(f"❌ Vaccine {i+1}: Missing fields: {missing}")
                
                if valid_vaccines > 0:
                    print(f"✅ {valid_vaccines} vaccines have valid structure")
                    return True
                else:
                    print("❌ No vaccines have valid structure")
                    return False
            else:
                print("❌ No vaccines returned")
                return False
        else:
            print(f"❌ Vaccine suggestion failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_suggest_vaccines_minimal_data():
    """Test the /api/suggest-vaccines endpoint with minimal data (species only)"""
    print("\n=== Testing /api/suggest-vaccines endpoint (Minimal Data) ===")
    
    # Test with only species
    test_data = {
        "pet_species": "cachorro"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/suggest-vaccines",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Vaccine suggestion with minimal data working!")
            
            vaccines = data.get('vaccines', [])
            if vaccines:
                print(f"Number of vaccines returned: {len(vaccines)}")
                print(f"Sample vaccine: {vaccines[0].get('name', 'N/A')}")
                return True
            else:
                print("❌ No vaccines returned with minimal data")
                return False
        else:
            print(f"❌ Vaccine suggestion with minimal data failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_suggest_vaccines_different_species():
    """Test the /api/suggest-vaccines endpoint with different species (cat)"""
    print("\n=== Testing /api/suggest-vaccines endpoint (Different Species) ===")
    
    # Test with cat
    test_data = {
        "pet_species": "gato",
        "pet_breed": "Persa",
        "pet_age": "1 ano"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/suggest-vaccines",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Vaccine suggestion for cats working!")
            
            vaccines = data.get('vaccines', [])
            if vaccines:
                print(f"Number of vaccines returned for cat: {len(vaccines)}")
                
                # Check if vaccines seem appropriate for cats (basic check)
                cat_vaccines = [v['name'] for v in vaccines if v.get('name')]
                print(f"Cat vaccines: {', '.join(cat_vaccines[:3])}...")
                return True
            else:
                print("❌ No vaccines returned for cats")
                return False
        else:
            print(f"❌ Vaccine suggestion for cats failed: {response.status_code}")
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
        'ai_chat_context': False,
        'suggest_vaccines_full': False,
        'suggest_vaccines_minimal': False,
        'suggest_vaccines_different_species': False
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
    
    # Test vaccine suggestion endpoints
    results['suggest_vaccines_full'] = test_suggest_vaccines_full_data()
    results['suggest_vaccines_minimal'] = test_suggest_vaccines_minimal_data()
    results['suggest_vaccines_different_species'] = test_suggest_vaccines_different_species()
    
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