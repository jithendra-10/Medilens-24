import requests
import json

payload = {
    "patient_age": 30,
    "patient_gender": "Male",
    "tests": {"Hemoglobin": {"value": 12, "unit": "g/dL", "status": "Low"}},
    "analytics": {},
    "alert": {},
    "confidence": {},
    "explanation": "Analysis completed.",
    "priority_list": [],
    "trend": None,
    "language": "English",
    "mode": "patient"
}

try:
    res = requests.post("http://localhost:8001/api/generate-pdf", json=payload)
    print("STATUS:", res.status_code)
    try:
        print(res.json())
    except:
        print(res.text[:500])
except Exception as e:
    print(e)
