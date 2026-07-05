import requests

def test_login():
    url = "http://localhost:8001/api/auth/login"
    data = {
        "username": "test2@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
