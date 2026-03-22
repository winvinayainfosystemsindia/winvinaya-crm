from fastapi import APIRouter, HTTPException, Query
import httpx
from typing import Optional

router = APIRouter(prefix="/x0pa", tags=["X0PA Integration"])

X0PA_BASE_URL = "https://api.x0pa.ai/stp/v1/winvinaya"
X_SAPI_KEY = "d5ecfcee5fd74483bb0c319e9a82104f"
X_API_KEY = "wvf_xe_hiGQb442bdSuGVB4XdzkFWsnYt5gucto"

@router.get("/jobs")
async def proxy_x0pa_jobs(
    searchKey: Optional[str] = Query(None),
    limit: int = Query(10, le=500),
    offset: int = Query(0),
    minExp: Optional[int] = Query(None),
    maxExp: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
):
    """
    Proxy request to X0PA Jobs API to avoid CORS issues.
    """
    params = {
        "limit": limit,
        "offset": offset,
    }
    if searchKey:
        params["searchKey"] = searchKey
    if minExp is not None:
        params["minExp"] = minExp
    if maxExp is not None:
        params["maxExp"] = maxExp
    if location:
        params["location"] = location

    headers = {
        "x-sapi-key": X_SAPI_KEY,
        "x-api-key": X_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{X0PA_BASE_URL}/jobs",
                params=params,
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            # Forward the status code and detail from X0PA if possible
            raise HTTPException(
                status_code=e.response.status_code, 
                detail=f"X0PA API Error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Proxy Error: {str(e)}")
