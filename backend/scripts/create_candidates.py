import requests
import random
from datetime import date, timedelta
import sys
import time

# Reconfigure stdout/stderr to support unicode/emojis on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


URL = "https://dev-crm.winvinaya.com/api/v1/candidates/"

# Data derived from frontend/src/data
DEGREES = [
    "B.Tech", "B.E", "B.Sc", "B.Com", "B.A", "B.B.A", "B.C.A",
    "M.Tech", "M.E", "M.Sc", "M.Com", "M.A", "M.B.A", "M.C.A",
    "Ph.D", "Diploma", "Other"
]

COLLEGES = [
    "Anna University", "Bangalore University", "Technological University",
    "Bharathiar University", "Bharathidasan University", "Madras University",
    "Delhi University", "Mumbai University", "Calcutta University",
    "Jawaharlal Nehru University", "Banaras Hindu University", "Osmania University",
    "University of Hyderabad", "VIT University", "SRM University",
    "Manipal University", "Amrita Vishwa Vidyapeetham", "Other"
]

SPECIALIZATIONS = [
    "Computer Science", "Information Technology", "Electronics and Communication",
    "Electrical and Electronics", "Mechanical Engineering", "Civil Engineering",
    "Commerce", "Accounting", "Finance", "Marketing", "Human Resources",
    "English", "Economics", "History", "Physics", "Chemistry",
    "Mathematics", "Biology", "Psychology", "Sociology", "General", "Other"
]

DISABILITY_TYPES = [
    "Locomotor Disability",
    "Hearing Impairment (Deaf and Hard of Hearing)",
    "Blindness",
    "Low Vision"
]

def random_dob(start_year=1985, end_year=2004):
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

for i in range(1, 51):
    is_disabled = random.choice([True, True, True, False]) # 75% chance of being disabled for better test data
    
    payload = {
        "name": f"Candidate {i}",
        "gender": random.choice(["male", "female"]),
        "email": f"candidate{i}@example.com",
        "phone": f"9{random.randint(100000000, 999999999)}",
        "whatsapp_number": f"9{random.randint(100000000, 999999999)}",
        "dob": random_dob().isoformat(),
        "pincode": "560001",
        "city": "Bengaluru",
        "district": "Bengaluru Urban",
        "state": "Karnataka",

        "guardian_details": {
            "parent_name": f"Parent {i}",
            "relationship": "Father",
            "parent_phone": f"9{random.randint(100000000, 999999999)}"
        },

        "work_experience": {
            "is_experienced": True,
            "currently_employed": random.choice([True, False]),
            "year_of_experience": f"{random.randint(1, 8)} years"
        },

        "education_details": {
            "degrees": [
                {
                    "degree_name": random.choice(DEGREES),
                    "specialization": random.choice(SPECIALIZATIONS),
                    "college_name": random.choice(COLLEGES),
                    "year_of_passing": random.randint(2015, 2022),
                    "percentage": round(random.uniform(60, 85), 2)
                }
            ]
        },

        "disability_details": {
            "is_disabled": is_disabled,
            "disability_type": random.choice(DISABILITY_TYPES) if is_disabled else None,
            "disability_percentage": random.randint(40, 90) if is_disabled else 0
        }
    }

    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = requests.post(URL, json=payload)
            
            if response.status_code == 429:
                wait_time = 10 * (attempt + 1)
                print(f"Rate limit hit on Candidate {i}. Waiting {wait_time}s to retry (Attempt {attempt+1}/{max_retries})...")
                time.sleep(wait_time)
                continue
                
            if response.status_code == 201:
                print(f"Candidate {i} created successfully | {payload['disability_details']['disability_type'] or 'None'}")
            else:
                print(f"Candidate {i} failed | {response.status_code} | {response.text}")
            break
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Connection Error on Candidate {i} after {max_retries} attempts: {e}")
                break
            print(f"Connection Error on Candidate {i}: {e}. Retrying in 3s...")
            time.sleep(3)

