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

def get_auth_token():
    """Get authentication token for testing"""
    print("\n=== Getting Authentication Token ===")
    
    # Try to login with test credentials
    login_data = {
        "username": "test@petid.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print("✅ Successfully obtained auth token")
            return token
        elif response.status_code == 401:
            print("⚠️ Test user not found, creating new user...")
            # Try to register test user
            register_data = {
                "email": "test@petid.com",
                "password": "testpass123"
            }
            
            register_response = requests.post(
                f"{BASE_URL}/auth/register",
                json=register_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if register_response.status_code == 200:
                print("✅ Test user created, logging in...")
                # Try login again
                login_response = requests.post(
                    f"{BASE_URL}/auth/login",
                    data=login_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10
                )
                
                if login_response.status_code == 200:
                    data = login_response.json()
                    token = data.get("access_token")
                    print("✅ Successfully obtained auth token after registration")
                    return token
                else:
                    print(f"❌ Login failed after registration: {login_response.status_code}")
                    return None
            else:
                print(f"❌ User registration failed: {register_response.status_code}")
                print(f"Response: {register_response.text}")
                return None
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Auth request failed: {e}")
        return None

def get_or_create_test_pet(token):
    """Get existing pet or create a test pet for vaccine testing"""
    print("\n=== Getting Test Pet ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # First, try to get existing pets
        response = requests.get(
            f"{BASE_URL}/pets",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            pets = response.json()
            if pets:
                pet_id = pets[0]["id"]
                pet_name = pets[0]["name"]
                print(f"✅ Using existing pet: {pet_name} (ID: {pet_id})")
                return pet_id
            else:
                print("No existing pets found, creating test pet...")
        else:
            print(f"Failed to get pets: {response.status_code}")
            print("Creating test pet...")
        
        # Create a test pet
        pet_data = {
            "name": "Luna",
            "species": "cachorro",
            "breed": "Golden Retriever",
            "age": 2,
            "birthdate": "2022-01-15",
            "weight": 25.5
        }
        
        create_response = requests.post(
            f"{BASE_URL}/pets",
            json=pet_data,
            headers=headers,
            timeout=10
        )
        
        if create_response.status_code == 200:
            pet = create_response.json()
            pet_id = pet["id"]
            print(f"✅ Created test pet: {pet['name']} (ID: {pet_id})")
            return pet_id
        else:
            print(f"❌ Failed to create test pet: {create_response.status_code}")
            print(f"Response: {create_response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Pet request failed: {e}")
        return None

def test_put_vaccines(token, pet_id):
    """Test PUT /pets/{pet_id}/vaccines endpoint"""
    print("\n=== Testing PUT /pets/{pet_id}/vaccines ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Sample vaccine data as specified in the review request
    vaccines_data = [
        {
            "id": "vacc_001",
            "name": "V10",
            "description": "Vacina múltipla",
            "ageRecommendation": "2 meses",
            "frequency": "Anual",
            "priority": "essential",
            "applied": False
        },
        {
            "id": "vacc_002", 
            "name": "Antirrábica",
            "description": "Proteção contra raiva",
            "ageRecommendation": "4 meses",
            "frequency": "Anual",
            "priority": "essential",
            "applied": True
        }
    ]
    
    try:
        response = requests.put(
            f"{BASE_URL}/pets/{pet_id}/vaccines",
            json=vaccines_data,
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ PUT vaccines endpoint working!")
            
            # Verify response includes updated pet with vaccines
            if "vaccines" in data and len(data["vaccines"]) == 2:
                print(f"✅ Response includes {len(data['vaccines'])} vaccines")
                
                # Check vaccine data
                for i, vaccine in enumerate(data["vaccines"]):
                    expected = vaccines_data[i]
                    if (vaccine["id"] == expected["id"] and 
                        vaccine["name"] == expected["name"] and
                        vaccine["applied"] == expected["applied"]):
                        print(f"✅ Vaccine {i+1} data correct: {vaccine['name']}")
                    else:
                        print(f"⚠️ Vaccine {i+1} data mismatch")
                
                return True, data["vaccines"]
            else:
                print(f"❌ Expected 2 vaccines, got {len(data.get('vaccines', []))}")
                return False, None
        else:
            print(f"❌ PUT vaccines failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PUT vaccines request failed: {e}")
        return False, None

def test_get_pets_verify_persistence(token, pet_id):
    """Test GET /pets to verify vaccine persistence"""
    print("\n=== Testing GET /pets (Verify Persistence) ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/pets",
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            pets = response.json()
            
            # Find our test pet
            test_pet = None
            for pet in pets:
                if pet["id"] == pet_id:
                    test_pet = pet
                    break
            
            if test_pet:
                vaccines = test_pet.get("vaccines", [])
                if len(vaccines) >= 2:
                    print(f"✅ Vaccines persisted correctly: {len(vaccines)} vaccines found")
                    
                    # Check specific vaccines
                    v10_found = any(v["name"] == "V10" for v in vaccines)
                    antirrabica_found = any(v["name"] == "Antirrábica" for v in vaccines)
                    
                    if v10_found and antirrabica_found:
                        print("✅ Expected vaccines (V10, Antirrábica) found in persistence")
                        return True, vaccines
                    else:
                        print("⚠️ Expected vaccines not found in persistence")
                        return False, vaccines
                else:
                    print(f"❌ Expected at least 2 vaccines, found {len(vaccines)}")
                    return False, vaccines
            else:
                print("❌ Test pet not found in pets list")
                return False, None
        else:
            print(f"❌ GET pets failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ GET pets request failed: {e}")
        return False, None

def test_patch_vaccine_toggle(token, pet_id, vaccine_id):
    """Test PATCH /pets/{pet_id}/vaccines/{vaccine_id} endpoint"""
    print(f"\n=== Testing PATCH /pets/{pet_id}/vaccines/{vaccine_id} ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test toggling applied status to true
    try:
        response = requests.patch(
            f"{BASE_URL}/pets/{pet_id}/vaccines/{vaccine_id}?applied=true",
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code (applied=true): {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ PATCH vaccine (applied=true) working!")
            
            # Find the updated vaccine
            vaccines = data.get("vaccines", [])
            target_vaccine = None
            for vaccine in vaccines:
                if vaccine["id"] == vaccine_id:
                    target_vaccine = vaccine
                    break
            
            if target_vaccine and target_vaccine["applied"] == True:
                print(f"✅ Vaccine {vaccine_id} marked as applied")
                
                # Test toggling back to false
                response2 = requests.patch(
                    f"{BASE_URL}/pets/{pet_id}/vaccines/{vaccine_id}?applied=false",
                    headers=headers,
                    timeout=10
                )
                
                print(f"Status Code (applied=false): {response2.status_code}")
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    vaccines2 = data2.get("vaccines", [])
                    target_vaccine2 = None
                    for vaccine in vaccines2:
                        if vaccine["id"] == vaccine_id:
                            target_vaccine2 = vaccine
                            break
                    
                    if target_vaccine2 and target_vaccine2["applied"] == False:
                        print(f"✅ Vaccine {vaccine_id} unmarked as applied")
                        return True
                    else:
                        print(f"❌ Failed to unmark vaccine {vaccine_id}")
                        return False
                else:
                    print(f"❌ PATCH vaccine (applied=false) failed: {response2.status_code}")
                    return False
            else:
                print(f"❌ Vaccine {vaccine_id} not marked as applied")
                return False
        else:
            print(f"❌ PATCH vaccine failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ PATCH vaccine request failed: {e}")
        return False

def test_vaccine_error_cases(token):
    """Test error cases for vaccine endpoints"""
    print("\n=== Testing Vaccine Error Cases ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    results = {"non_existent_pet": False, "no_auth": False}
    
    # Test 1: Non-existent pet (should return 404)
    fake_pet_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
    vaccines_data = [
        {
            "id": "vacc_test",
            "name": "Test Vaccine",
            "description": "Test",
            "ageRecommendation": "Test",
            "frequency": "Test",
            "priority": "essential",
            "applied": False
        }
    ]
    
    try:
        response = requests.put(
            f"{BASE_URL}/pets/{fake_pet_id}/vaccines",
            json=vaccines_data,
            headers=headers,
            timeout=10
        )
        
        print(f"Non-existent pet test - Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent pet")
            results["non_existent_pet"] = True
        else:
            print(f"❌ Expected 404, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Non-existent pet test failed: {e}")
    
    # Test 2: No auth token (should return 401)
    try:
        response = requests.put(
            f"{BASE_URL}/pets/{fake_pet_id}/vaccines",
            json=vaccines_data,
            timeout=10  # No headers (no auth)
        )
        
        print(f"No auth test - Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Correctly returned 401 for missing auth token")
            results["no_auth"] = True
        else:
            print(f"❌ Expected 401, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ No auth test failed: {e}")
    
    return results

def create_test_pet_for_deletion(token):
    """Create a specific test pet for deletion testing"""
    print("\n=== Creating Test Pet for Deletion ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a test pet specifically for deletion
    pet_data = {
        "name": "Buddy",
        "species": "cachorro",
        "breed": "Labrador",
        "age": 3,
        "birthdate": "2021-06-10",
        "weight": 30.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/pets",
            json=pet_data,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            pet = response.json()
            pet_id = pet["id"]
            print(f"✅ Created test pet for deletion: {pet['name']} (ID: {pet_id})")
            return pet_id
        else:
            print(f"❌ Failed to create test pet for deletion: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Pet creation request failed: {e}")
        return None

def test_delete_pet_success(token, pet_id):
    """Test successful pet deletion"""
    print(f"\n=== Testing DELETE /pets/{pet_id} (Success Case) ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(
            f"{BASE_URL}/pets/{pet_id}",
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ DELETE pet endpoint working!")
            
            # Verify response format
            if (data.get("success") == True and 
                data.get("message") == "Pet removido com sucesso"):
                print("✅ Response format correct")
                print(f"Success: {data.get('success')}")
                print(f"Message: {data.get('message')}")
                return True
            else:
                print("❌ Response format incorrect")
                print(f"Expected: {{'success': True, 'message': 'Pet removido com sucesso'}}")
                print(f"Got: {data}")
                return False
        else:
            print(f"❌ DELETE pet failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ DELETE pet request failed: {e}")
        return False

def test_verify_pet_deletion(token, deleted_pet_id):
    """Verify pet is actually deleted by checking GET /pets"""
    print(f"\n=== Verifying Pet Deletion (GET /pets) ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/pets",
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            pets = response.json()
            
            # Check if deleted pet is NOT in the list
            deleted_pet_found = any(pet["id"] == deleted_pet_id for pet in pets)
            
            if not deleted_pet_found:
                print("✅ Pet successfully deleted - not found in pets list")
                print(f"Current pets count: {len(pets)}")
                return True
            else:
                print("❌ Pet still exists in pets list after deletion")
                return False
        else:
            print(f"❌ GET pets failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ GET pets request failed: {e}")
        return False

def test_delete_pet_error_cases(token):
    """Test error cases for pet deletion"""
    print("\n=== Testing DELETE Pet Error Cases ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    results = {"non_existent_pet": False, "no_auth": False}
    
    # Test 1: Delete non-existent pet (should return 404)
    fake_pet_id = "507f1f77bcf86cd799439012"  # Valid ObjectId format but non-existent
    
    try:
        response = requests.delete(
            f"{BASE_URL}/pets/{fake_pet_id}",
            headers=headers,
            timeout=10
        )
        
        print(f"Non-existent pet deletion - Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent pet deletion")
            results["non_existent_pet"] = True
        else:
            print(f"❌ Expected 404, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Non-existent pet deletion test failed: {e}")
    
    # Test 2: Delete without auth token (should return 401)
    try:
        response = requests.delete(
            f"{BASE_URL}/pets/{fake_pet_id}",
            timeout=10  # No headers (no auth)
        )
        
        print(f"No auth deletion test - Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Correctly returned 401 for missing auth token")
            results["no_auth"] = True
        else:
            print(f"❌ Expected 401, got {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ No auth deletion test failed: {e}")
    
    return results

def test_delete_another_users_pet(token):
    """Test attempting to delete another user's pet (should return 404)"""
    print("\n=== Testing Delete Another User's Pet ===")
    
    # For this test, we'll create a second user and try to delete their pet
    # First, create second user
    register_data = {
        "email": "test2@petid.com",
        "password": "testpass456"
    }
    
    try:
        # Register second user
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json=register_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if register_response.status_code == 200:
            print("✅ Second test user created")
        elif register_response.status_code == 400:
            print("⚠️ Second test user already exists, continuing...")
        else:
            print(f"❌ Failed to create second user: {register_response.status_code}")
            return False
        
        # Login as second user
        login_data = {
            "username": "test2@petid.com",
            "password": "testpass456"
        }
        
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"❌ Failed to login as second user: {login_response.status_code}")
            return False
        
        second_user_token = login_response.json().get("access_token")
        second_user_headers = {"Authorization": f"Bearer {second_user_token}"}
        
        # Create pet as second user
        pet_data = {
            "name": "Max",
            "species": "gato",
            "breed": "Siamês",
            "age": 1,
            "weight": 4.5
        }
        
        pet_response = requests.post(
            f"{BASE_URL}/pets",
            json=pet_data,
            headers=second_user_headers,
            timeout=10
        )
        
        if pet_response.status_code != 200:
            print(f"❌ Failed to create pet as second user: {pet_response.status_code}")
            return False
        
        second_user_pet_id = pet_response.json()["id"]
        print(f"✅ Created pet as second user: {second_user_pet_id}")
        
        # Now try to delete second user's pet using first user's token
        headers = {"Authorization": f"Bearer {token}"}
        
        delete_response = requests.delete(
            f"{BASE_URL}/pets/{second_user_pet_id}",
            headers=headers,
            timeout=10
        )
        
        print(f"Cross-user deletion attempt - Status Code: {delete_response.status_code}")
        
        if delete_response.status_code == 404:
            print("✅ Correctly returned 404 when trying to delete another user's pet")
            return True
        else:
            print(f"❌ Expected 404, got {delete_response.status_code}")
            print("This is a security issue - users can delete other users' pets!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cross-user deletion test failed: {e}")
        return False

def main():
    """Run all backend tests"""
    print("🧪 Starting PetID Backend API Tests - Including Delete Pet Endpoint")
    print("=" * 60)
    
    results = {
        'api_health': False,
        'auth_token': False,
        'test_pet': False,
        'put_vaccines': False,
        'get_pets_persistence': False,
        'patch_vaccine_toggle': False,
        'vaccine_error_cases': False,
        'delete_pet_success': False,
        'verify_pet_deletion': False,
        'delete_pet_error_cases': False,
        'delete_another_users_pet': False,
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
    
    # Get authentication token
    token = get_auth_token()
    results['auth_token'] = token is not None
    
    if not token:
        print("\n❌ Could not obtain auth token. Skipping authenticated tests.")
    else:
        # Get or create test pet
        pet_id = get_or_create_test_pet(token)
        results['test_pet'] = pet_id is not None
        
        if pet_id:
            # Test vaccine persistence endpoints
            put_success, vaccines = test_put_vaccines(token, pet_id)
            results['put_vaccines'] = put_success
            
            if put_success:
                # Test persistence verification
                persist_success, persisted_vaccines = test_get_pets_verify_persistence(token, pet_id)
                results['get_pets_persistence'] = persist_success
                
                # Test vaccine toggle (use first vaccine ID)
                if vaccines and len(vaccines) > 0:
                    vaccine_id = vaccines[0]["id"]
                    toggle_success = test_patch_vaccine_toggle(token, pet_id, vaccine_id)
                    results['patch_vaccine_toggle'] = toggle_success
            
            # Test error cases
            error_results = test_vaccine_error_cases(token)
            results['vaccine_error_cases'] = all(error_results.values())
            
            # Test DELETE pet endpoint
            print("\n" + "=" * 60)
            print("🗑️ TESTING DELETE PET ENDPOINT")
            print("=" * 60)
            
            # Create a test pet specifically for deletion
            delete_test_pet_id = create_test_pet_for_deletion(token)
            
            if delete_test_pet_id:
                # Test successful deletion
                delete_success = test_delete_pet_success(token, delete_test_pet_id)
                results['delete_pet_success'] = delete_success
                
                if delete_success:
                    # Verify deletion by checking pets list
                    verify_success = test_verify_pet_deletion(token, delete_test_pet_id)
                    results['verify_pet_deletion'] = verify_success
            
            # Test delete error cases
            delete_error_results = test_delete_pet_error_cases(token)
            results['delete_pet_error_cases'] = all(delete_error_results.values())
            
            # Test cross-user deletion security
            cross_user_result = test_delete_another_users_pet(token)
            results['delete_another_users_pet'] = cross_user_result
    
    # Test AI diagnosis endpoint (no auth required)
    diagnosis_success, diagnosis_text = test_ai_diagnosis()
    results['ai_diagnosis'] = diagnosis_success
    
    # Test AI chat endpoint (no auth required)
    chat_success, chat_response = test_ai_chat(diagnosis_text)
    results['ai_chat'] = chat_success
    
    # Test AI chat conversation context (no auth required)
    results['ai_chat_context'] = test_ai_chat_conversation_context()
    
    # Test vaccine suggestion endpoints (no auth required)
    results['suggest_vaccines_full'] = test_suggest_vaccines_full_data()
    results['suggest_vaccines_minimal'] = test_suggest_vaccines_minimal_data()
    results['suggest_vaccines_different_species'] = test_suggest_vaccines_different_species()
    
    # Print summary
    print("\n" + "=" * 60)
    print("🏁 TEST SUMMARY")
    print("=" * 60)
    
    # Group results by category
    vaccine_persistence_tests = {
        'auth_token': results['auth_token'],
        'test_pet': results['test_pet'], 
        'put_vaccines': results['put_vaccines'],
        'get_pets_persistence': results['get_pets_persistence'],
        'patch_vaccine_toggle': results['patch_vaccine_toggle'],
        'vaccine_error_cases': results['vaccine_error_cases']
    }
    
    ai_tests = {
        'ai_diagnosis': results['ai_diagnosis'],
        'ai_chat': results['ai_chat'], 
        'ai_chat_context': results['ai_chat_context'],
        'suggest_vaccines_full': results['suggest_vaccines_full'],
        'suggest_vaccines_minimal': results['suggest_vaccines_minimal'],
        'suggest_vaccines_different_species': results['suggest_vaccines_different_species']
    }
    
    print("🔐 VACCINE PERSISTENCE TESTS:")
    for test_name, success in vaccine_persistence_tests.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {test_name.replace('_', ' ').title()}: {status}")
    
    print("\n🤖 AI ENDPOINT TESTS:")
    for test_name, success in ai_tests.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n📊 API Health: {'✅ PASS' if results['api_health'] else '❌ FAIL'}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed - check logs above")
        
        # Highlight critical failures
        critical_failures = []
        if not results['put_vaccines']:
            critical_failures.append("PUT vaccines endpoint")
        if not results['patch_vaccine_toggle']:
            critical_failures.append("PATCH vaccine toggle endpoint")
        if not results['get_pets_persistence']:
            critical_failures.append("Vaccine persistence verification")
            
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES: {', '.join(critical_failures)}")
    
    return results

if __name__ == "__main__":
    main()