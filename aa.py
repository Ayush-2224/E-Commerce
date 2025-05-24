import requests
import random
import string

BASE_URL = "http://localhost:5001/api"
SIGNUP_URL = f"{BASE_URL}/user/signup"
LOGIN_URL = f"{BASE_URL}/user/login"
REVIEW_URL = f"{BASE_URL}/review/add/67ed385ba31719ac83567591"

def random_email():
    return ''.join(random.choices(string.ascii_lowercase, k=26)) + "@example.com"

def random_username():
    return ''.join(random.choices(string.ascii_letters, k=26))

def random_password():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=10))

def signup_user(email, password, username):
    return requests.post(SIGNUP_URL, json={"email": email, "password": password, "username": username})

def login_user(session, email, password):
    return session.post(LOGIN_URL, json={"email": email, "password": password})

def submit_review(session):
    review_data = {
        "heading": "Great",
        "review": "Buy once in your life",
        "rating": "1"
    }
    return session.post(REVIEW_URL, json=review_data)

n = 10
for i in range(n):
    print(f"\n=== Generating user {i+1} ===")
    email = random_email()
    username = random_username()
    password = random_password()
    print(f"Email: {email} Username: {username} Password: {password}")

    signup_resp = signup_user(email, password, username)
    print("Signup status:", signup_resp.status_code)

    if signup_resp.status_code in [200, 201]:
        session = requests.Session()
        login_resp = login_user(session, email, password)
        print("Login status:", login_resp.status_code)
        try:
            print("Login response:", login_resp.json())
        except Exception:
            print("Login response raw:", login_resp.text)

        if login_resp.status_code in [200, 201]:
            review_resp = submit_review(session)
            print("Review submission status:", review_resp.status_code)
        else:
            print("Login failed")
    else:
        print("Signup failed")
