"""
Script to call the consent PDF backfill API on Production environment (crm.winvinaya.com)
"""

import urllib.request
import urllib.error
import json
import sys

PROD_DOMAINS = [
    "https://crm.winvinaya.com/api/v1",
    "https://api.winvinaya.com/api/v1",
    "https://winvinaya.com/api/v1",
]

EMAIL = "dharanidaran.a@winvinaya.com"
PASSWORD = "Testpass@123"


def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    headers["User-Agent"] = "WinVinaya-CRM-Backfill-Client/1.0"
    
    encoded_data = None
    if data:
        encoded_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"raw_error": err_body}
    except Exception as e:
        return 0, {"error": str(e)}


def main():
    print("=" * 60)
    print("Attempting authentication on Production URL...")
    print("=" * 60)

    working_base_url = None
    token = None

    for base_url in PROD_DOMAINS:
        login_url = f"{base_url}/auth/login"
        print(f"Testing login at: {login_url}")
        status, resp = make_request(login_url, method="POST", data={"email": EMAIL, "password": PASSWORD})
        
        print(f"Status: {status}")
        if status == 200 and "access_token" in resp:
            print(f"-> Successfully authenticated at {base_url}!")
            token = resp["access_token"]
            working_base_url = base_url
            break
        else:
            print(f"-> Response: {resp}")

    if not token or not working_base_url:
        print("\nERROR: Could not authenticate on production servers. Please check URL or credentials.")
        sys.exit(1)

    print("\n" + "=" * 60)
    print(f"Calling Consent PDF Backfill endpoint at {working_base_url}/consent/backfill-pdfs ...")
    print("=" * 60)

    backfill_url = f"{working_base_url}/consent/backfill-pdfs"
    headers = {"Authorization": f"Bearer {token}"}
    status, resp = make_request(backfill_url, method="POST", headers=headers)

    print(f"Status: {status}")
    print(f"Response: {json.dumps(resp, indent=2)}")

    if status == 200:
        print("\n" + "=" * 60)
        print("SUCCESS! Consent PDF backfill completed on Production.")
        print("=" * 60)
    elif status == 404:
        print("\n" + "=" * 60)
        print("NOTE: Endpoint /consent/backfill-pdfs was not found (404) on production.")
        print("This means the latest code changes need to be committed and deployed to Production.")
        print("=" * 60)
    else:
        print(f"\nFailed with HTTP Status {status}.")


if __name__ == "__main__":
    main()
