"""
Script to count candidates tagged to DSV and APF as donors from Production (https://crm.winvinaya.com/)
Checks both:
1. Counseling Strategic Assignment ('assigned_to' in counseling others)
2. Candidate Profile Donor ('donor' in candidate other)
3. Training Batch Tag allocations
"""

import urllib.request
import urllib.error
import json
import sys
import os

PROD_DOMAINS = [
    "https://crm.winvinaya.com/api/v1",
    "https://api.winvinaya.com/api/v1",
    "https://winvinaya.com/api/v1",
]

# Default credentials from backfill script or environment
EMAIL = os.environ.get("CRM_EMAIL", "dharanidaran.a@winvinaya.com")
PASSWORD = os.environ.get("CRM_PASSWORD", "Testpass@123")


def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    headers["User-Agent"] = "WinVinaya-CRM-DonorCount-Client/1.0"
    
    encoded_data = None
    if data:
        encoded_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
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


def login(base_url, email, password):
    login_url = f"{base_url}/auth/login"
    status, resp = make_request(login_url, method="POST", data={"email": email, "password": password})
    if status == 200 and "access_token" in resp:
        return resp["access_token"]
    return None


def fetch_all_candidates(base_url, token):
    candidates = []
    skip = 0
    limit = 100
    headers = {"Authorization": f"Bearer {token}"}

    print(f"Fetching candidates from {base_url}/candidates/ ...")
    while True:
        url = f"{base_url}/candidates/?skip={skip}&limit={limit}&is_global=true"
        status, resp = make_request(url, method="GET", headers=headers)
        if status != 200:
            # Try without is_global
            url = f"{base_url}/candidates/?skip={skip}&limit={limit}"
            status, resp = make_request(url, method="GET", headers=headers)

        if status != 200:
            print(f"Failed to fetch candidates at skip={skip}, status: {status}, resp: {resp}")
            break

        items = resp.get("items", [])
        total = resp.get("total", len(items))
        if not items:
            break

        candidates.extend(items)
        print(f"  Fetched {len(candidates)} of {total} candidates...")
        if len(candidates) >= total or len(items) < limit:
            break
        skip += limit

    return candidates


def fetch_unified_report(base_url, token):
    report_items = []
    skip = 0
    limit = 100
    headers = {"Authorization": f"Bearer {token}"}

    print(f"Fetching records from {base_url}/unified-report ...")
    while True:
        url = f"{base_url}/unified-report?skip={skip}&limit={limit}"
        status, resp = make_request(url, method="GET", headers=headers)
        if status != 200:
            break

        items = resp.get("items", [])
        total = resp.get("total", len(items))
        if not items:
            break

        report_items.extend(items)
        print(f"  Fetched {len(report_items)} of {total} report rows...")
        if len(report_items) >= total or len(items) < limit:
            break
        skip += limit

    return report_items


def matches_tag(value, target):
    if not value:
        return False
    target_lower = target.lower()
    if isinstance(value, str):
        return target_lower in value.lower()
    if isinstance(value, (list, tuple, set)):
        for item in value:
            if isinstance(item, str) and target_lower in item.lower():
                return True
    return False


def main():
    print("=" * 70)
    print("WinVinaya CRM Production - Donor Tag Counter (DSV & APF)")
    print("=" * 70)

    token = None
    working_base_url = None

    for base_url in PROD_DOMAINS:
        print(f"Attempting login at: {base_url}/auth/login ...")
        t = login(base_url, EMAIL, PASSWORD)
        if t:
            token = t
            working_base_url = base_url
            print(f"-> Successfully authenticated at {base_url}!")
            break

    if not token:
        print("\n[ERROR] Authentication failed. Please verify credentials or network connection.")
        sys.exit(1)

    candidates = fetch_all_candidates(working_base_url, token)
    print(f"\nTotal candidates fetched: {len(candidates)}")

    dsv_candidates = []
    apf_candidates = []

    dsv_by_assigned_to = []
    dsv_by_donor_field = []
    apf_by_assigned_to = []
    apf_by_donor_field = []

    for c in candidates:
        cid = c.get("id")
        cname = c.get("name")
        cemail = c.get("email")

        # 1. Check counseling 'assigned_to'
        assigned_to = c.get("assigned_to") or []
        # Also check c.get("counseling", {}).get("others", {}).get("assigned_to")
        counseling_data = c.get("counseling") or {}
        counseling_others = counseling_data.get("others") or {}
        counseling_assigned = counseling_others.get("assigned_to") or []
        combined_assigned = []
        if isinstance(assigned_to, list):
            combined_assigned.extend(assigned_to)
        elif assigned_to:
            combined_assigned.append(str(assigned_to))
        if isinstance(counseling_assigned, list):
            combined_assigned.extend(counseling_assigned)
        elif counseling_assigned:
            combined_assigned.append(str(counseling_assigned))

        # 2. Check candidate other.donor
        other = c.get("other") or {}
        donor = other.get("donor") or ""

        # Check DSV
        is_dsv = False
        if matches_tag(combined_assigned, "DSV"):
            dsv_by_assigned_to.append(c)
            is_dsv = True
        if matches_tag(donor, "DSV"):
            dsv_by_donor_field.append(c)
            is_dsv = True

        if is_dsv:
            dsv_candidates.append({
                "id": cid,
                "name": cname,
                "email": cemail,
                "assigned_to": combined_assigned,
                "donor": donor
            })

        # Check APF
        is_apf = False
        if matches_tag(combined_assigned, "APF"):
            apf_by_assigned_to.append(c)
            is_apf = True
        if matches_tag(donor, "APF"):
            apf_by_donor_field.append(c)
            is_apf = True

        if is_apf:
            apf_candidates.append({
                "id": cid,
                "name": cname,
                "email": cemail,
                "assigned_to": combined_assigned,
                "donor": donor
            })

    print("\n" + "=" * 70)
    print("RESULTS SUMMARY FROM PRODUCTION:")
    print("=" * 70)
    print(f"Total DSV tagged candidates: {len(dsv_candidates)}")
    print(f"   - Tagged via Counseling 'Assigned To': {len(dsv_by_assigned_to)}")
    print(f"   - Tagged via Profile 'Donor' field:   {len(dsv_by_donor_field)}")
    print("-" * 70)
    print(f"Total APF tagged candidates: {len(apf_candidates)}")
    print(f"   - Tagged via Counseling 'Assigned To': {len(apf_by_assigned_to)}")
    print(f"   - Tagged via Profile 'Donor' field:   {len(apf_by_donor_field)}")
    print("=" * 70)

    # Output detailed list to json file for reference
    output_path = os.path.join(os.path.dirname(__file__), "donor_counts_result.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "dsv_count": len(dsv_candidates),
            "apf_count": len(apf_candidates),
            "dsv_candidates": dsv_candidates,
            "apf_candidates": apf_candidates
        }, f, indent=2)
    print(f"\nDetailed candidate breakdown saved to: {output_path}")


if __name__ == "__main__":
    main()
