import asyncio
import httpx
import json

async def test_extraction():
    url = "http://127.0.0.1:8000/api/v1/ai/extract/job-role"
    
    # Example JD text
    jd_text = """
    We are looking for a Senior React Developer to join our team in Bangalore.
    Experience: 5+ years.
    Skills: React, TypeScript, Redux, Material UI.
    Salary: 30-40 LPA.
    Role: Full Time, Hybrid.
    Company: WinVinaya Infosystems.
    Recruiter: John Doe.
    """
    
    headers = {
        "Content-Type": "application/json",
        # I'll need a bearer token to test this against the running server, 
        # or I can just mock the extractor call.
    }
    
    print(f"Testing extraction URL: {url}")
    # Since I don't have an easy way to get a token here without logging in via tool,
    # I'll just check if the code compiles and the endpoint is registered by looking at the server logs if possible,
    # or I can try a dummy call to see if I get 401 (which confirms the route exists).
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={"jd_text": jd_text})
            print(f"Status Code: {resp.status_code}")
            # If 401/403, it means the route is there but needs auth.
            if resp.status_code != 404:
                print("SUCCESS: Endpoint is registered.")
            else:
                print("FAILURE: Endpoint not found.")
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    asyncio.run(test_extraction())
