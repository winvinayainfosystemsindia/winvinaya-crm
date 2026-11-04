import asyncio
import httpx
from datetime import date

BASE_URL = "https://dev-crm.winvinaya.com/api/v1"
EMAIL = "dharanidaran.a@winvinaya.com"
PASSWORD = "Testpass@123"

async def verify():
    async with httpx.AsyncClient(verify=False, timeout=20.0) as client:
        # 1. Login
        print("\n--- 1. Authenticating ---")
        login_resp = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD}
        )
        if login_resp.status_code != 200:
            print(f"FAILED LOGIN: {login_resp.status_code} {login_resp.text}")
            return
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login SUCCESS!")

        # Current User
        me_resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
        user_info = me_resp.json()
        user_id = user_info.get("id")
        user_public_id = user_info.get("public_id")
        print(f"Logged in as User ID: {user_id}, Public ID: {user_public_id}")

        # 2. Candidate List
        print("\n--- 2. Checking Candidates API ---")
        cand_resp = await client.get(f"{BASE_URL}/candidates/?skip=0&limit=10", headers=headers)
        print(f"Candidates status: {cand_resp.status_code}")
        candidates = []
        if cand_resp.status_code == 200:
            candidates = cand_resp.json().get("items", [])
            print(f"Total candidates returned: {len(candidates)}")
            for c in candidates[:3]:
                print(f"  Candidate: {c.get('name') or c.get('first_name')}, is_disabled={c.get('is_disabled')}, docs={c.get('documents_uploaded')}")
        else:
            print(f"Error: {cand_resp.text}")

        # 3. Screening Stats & Tabs
        print("\n--- 3. Checking Screening Stats & Tabs ---")
        stats_resp = await client.get(f"{BASE_URL}/candidates/screening-stats", headers=headers)
        print(f"Screening Stats: {stats_resp.json()}")

        unscreened_resp = await client.get(f"{BASE_URL}/candidates/unscreened?skip=0&limit=5", headers=headers)
        unscreened_items = unscreened_resp.json().get("items", [])
        print(f"Tab 'Not Screened' (unscreened): {len(unscreened_items)} candidates")

        for status in ["In Progress", "Completed", "Rejected"]:
            screened_resp = await client.get(f"{BASE_URL}/candidates/screened?screening_status={status}&skip=0&limit=10", headers=headers)
            screened_items = screened_resp.json().get("items", [])
            print(f"Tab '{status}': {len(screened_items)} candidates")

        # 4. Counseling Details & Skills
        print("\n--- 4. Checking Counseling Details & Skills ---")
        for c in candidates:
            c_pub = c.get("public_id")
            detail_resp = await client.get(f"{BASE_URL}/candidates/{c_pub}?with_details=true", headers=headers)
            if detail_resp.status_code == 200:
                cdata = detail_resp.json()
                counseling = cdata.get("counseling")
                if counseling:
                    skills = counseling.get("skills", [])
                    print(f"Candidate {c.get('name')} Counseling Status: {counseling.get('status')}, Skills: {skills}")
                    break

        # 5. Document Stats & Tabs
        print("\n--- 5. Checking Document Collection Stats & Tabs ---")
        c_stats = await client.get(f"{BASE_URL}/candidates/stats", headers=headers)
        if c_stats.status_code == 200:
            s = c_stats.json()
            print(f"Candidate Stats (Not submitted: {s.get('candidates_not_submitted')}, Partial: {s.get('candidates_partially_submitted')}, Fully: {s.get('candidates_fully_submitted')})")
        for doc_tab in ["not_collected", "pending", "collected"]:
            doc_resp = await client.get(f"{BASE_URL}/candidates/screened?document_status={doc_tab}&skip=0&limit=10", headers=headers)
            if doc_resp.status_code == 200:
                items = doc_resp.json().get("items", [])
                print(f"Document Tab '{doc_tab}': {len(items)} candidates")
            else:
                print(f"Document Tab '{doc_tab}' error: {doc_resp.status_code} {doc_resp.text}")

        # 6. Training Batches & Plans & Attendance & Mock Interviews
        print("\n--- 6. Checking Training Module ---")
        batches_resp = await client.get(f"{BASE_URL}/training-batches/?skip=0&limit=10", headers=headers)
        print(f"Training Batches status: {batches_resp.status_code}")
        batches = batches_resp.json().get("items", []) if batches_resp.status_code == 200 else []
        print(f"Batches found: {len(batches)}")
        if batches:
            b1 = batches[0]
            b1_id = b1["id"]
            b1_pub_id = b1["public_id"]
            today_str = date.today().isoformat()
            print(f"Checking Batch {b1_id} ({b1.get('batch_name')}) [UUID: {b1_pub_id}]:")

            # Weekly plan
            plan_resp = await client.get(f"{BASE_URL}/training-batch-plans/batch/{b1_pub_id}?start_date={today_str}", headers=headers)
            print(f"Training plan status: {plan_resp.status_code}, periods: {len(plan_resp.json()) if plan_resp.status_code == 200 else plan_resp.text}")

            # Attendance for today
            att_resp = await client.get(f"{BASE_URL}/training-extensions/attendance/{b1_id}/date/{today_str}", headers=headers)
            print(f"Today's Attendance status: {att_resp.status_code}, records: {len(att_resp.json()) if att_resp.status_code == 200 else att_resp.text}")

            # Mock interviews
            mock_resp = await client.get(f"{BASE_URL}/training-extensions/mock-interviews/batch/{b1_id}", headers=headers)
            print(f"Mock Interviews status: {mock_resp.status_code}, records: {len(mock_resp.json()) if mock_resp.status_code == 200 else mock_resp.text}")

        # 7. DSR Projects & Activities
        print("\n--- 7. Checking DSR Projects & Activities ---")
        proj_resp = await client.get(f"{BASE_URL}/dsr/projects", headers=headers)
        projects = proj_resp.json().get("items", [])
        print(f"DSR Projects: {len(projects)}")
        if projects:
            p1_id = projects[0]["id"]
            act_resp = await client.get(f"{BASE_URL}/dsr/activities?project_id={p1_id}&assigned_to={user_public_id}", headers=headers)
            print(f"DSR Activities for Project {p1_id} and User {user_public_id}: {act_resp.status_code}, count: {len(act_resp.json().get('items', [])) if act_resp.status_code == 200 else act_resp.text}")

        # 8. Placement Job Roles & Mappings
        print("\n--- 8. Checking Placement Job Roles & Mappings ---")
        roles_resp = await client.get(f"{BASE_URL}/placement/job-roles/", headers=headers)
        print(f"Job Roles status: {roles_resp.status_code}")
        roles = []
        if roles_resp.status_code == 200:
            roles = roles_resp.json().get("items", [])
            print(f"Job Roles count: {len(roles)}")
        else:
            print(f"Job Roles error: {roles_resp.text}")

        if roles:
            r1 = roles[0]
            r1_id = r1["id"]
            r1_pub_id = r1["public_id"]
            title = r1.get("job_title", "")
            print(f"Checking Job Role '{title}' [UUID: {r1_pub_id}]:")
            match_resp = await client.get(f"{BASE_URL}/placement/mappings/match/{r1_pub_id}", headers=headers)
            print(f"Candidate Matches status: {match_resp.status_code}, count: {len(match_resp.json()) if match_resp.status_code == 200 else match_resp.text}")
            
            mapped_resp = await client.get(f"{BASE_URL}/placement/mappings/job-role/{r1_pub_id}", headers=headers)
            print(f"Mapped Candidates status: {mapped_resp.status_code}, count: {len(mapped_resp.json()) if mapped_resp.status_code == 200 else mapped_resp.text}")

if __name__ == "__main__":
    asyncio.run(verify())
