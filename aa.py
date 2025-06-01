import requests
import json

# ─── CONFIGURATION ─────────────────────────────────────────────────────────────

# Change this to match your server’s base URL:
BASE_URL = "http://localhost:5001/api"

# Endpoints (adjust if yours differ)
SIGNUP_ENDPOINT      = f"{BASE_URL}/seller/signup"
LOGIN_ENDPOINT       = f"{BASE_URL}/seller/login"
ADD_PRODUCT_ENDPOINT = f"{BASE_URL}/product/addProduct"

# Seller credentials (adjust as needed)
SELLER_DATA = {
    "username": "test_seller_123",
    "email": "test_seller_123@example.com",
    "password": "SuperSecurePassword!23",
    "address": "123 Test Lane, Testville"
}

# A minimal description payload for each phone.
# The backend expects `description` to be a JSON‐string of
# an array of objects, each with { type, data }.
DESCRIPTION_TEMPLATE = [
    {
        "type": "text",
        "data": "A brand-new smartphone with all the latest features."
    }
]

# ─── SCRIPT START ────────────────────────────────────────────────────────────────

def main():
    session = requests.Session()

    # 1) Attempt to sign up the seller. If the seller already exists, attempt login.
    print("Signing up seller...")
    signup_resp = session.post(
        SIGNUP_ENDPOINT,
        json=SELLER_DATA,
        headers={"Content-Type": "application/json"}
    )

    if signup_resp.status_code == 200:
        print("→ Seller signup successful. Cookies now set.\n")
    elif signup_resp.status_code == 401:
        # Assume 401 means "Seller Already exists! Please Login"
        print("→ Seller already exists; attempting to log in instead...")
        login_payload = {
            "email": SELLER_DATA["email"],
            "password": SELLER_DATA["password"]
        }
        login_resp = session.post(
            LOGIN_ENDPOINT,
            json=login_payload,
            headers={"Content-Type": "application/json"}
        )
        if login_resp.status_code != 200:
            print(f"✗ Login failed: {login_resp.status_code}  {login_resp.text}")
            return
        print("→ Login successful. Cookies now set.\n")
    else:
        print(f"✗ Signup failed: {signup_resp.status_code}  {signup_resp.text}")
        return

    # 2) Create phone products, sending `specifications` as an actual array.
    print("Creating phone products...")

    for i in range(1, 101):  # change to 1001 for 1000 total
        title = f"Phone Model {i}"
        payload = {
            "brand": "GenericPhoneCo",
            "title": title,
            "category": "Mobiles",
            "price": 199 + i,                # example price
            "mrp": 249 + i,                  # example MRP
            "quantity": 50,                  # stock quantity

            # description must be a JSON‐string that backend can JSON.parse()
            "description": json.dumps(DESCRIPTION_TEMPLATE),

            # specifications must be an actual array (not a string),
            # so Mongoose can cast it to [specificationGroupSchema].
            # We send an empty list here:
            "specifications": []
        }

        resp = session.post(
            ADD_PRODUCT_ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        if resp.status_code == 201:
            print(f"  • Created: {title}")
        else:
            print(f"  ✗ Failed to create {title} → [{resp.status_code}] {resp.text}")

    print("\nDone! Products have been (attempted to be) added.")

if __name__ == "__main__":
    main()
