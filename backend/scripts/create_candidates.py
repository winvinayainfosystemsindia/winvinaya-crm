import requests
import random
from datetime import date, timedelta

URL = "http://localhost:8000/api/v1/candidates/"

def random_dob(start_year=1985, end_year=2004):
    start = date(start_year, 1, 1)
    end = date(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

for i in range(1, 101):
    payload = {
        "name": f"Candidate {i}",
        "gender": random.choice(["male", "female"]),
        "email": f"candidate{i}@example.com",
        "phone": f"9{random.randint(100000000, 999999999)}",
        "whatsapp_number": f"9{random.randint(100000000, 999999999)}",
        "dob": random_dob().isoformat(),
        "pincode": "560001",

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
                    "degree_name": "B.E",
                    "specialization": "Computer Science",
                    "college_name": "VTU University",
                    "year_of_passing": random.randint(2015, 2022),
                    "percentage": round(random.uniform(60, 85), 2)
                }
            ]
        },

        "disability_details": {
            "is_disabled": random.choice([True, False]),
            "disability_type": "Locomotor Disability",
            "disability_percentage": random.randint(10, 60)
        }
    }

    response = requests.post(URL, json=payload)

    if response.status_code == 201:
        print(f"✅ Candidate {i} created successfully")
    else:
        print(f"❌ Candidate {i} failed | {response.status_code} | {response.text}")
