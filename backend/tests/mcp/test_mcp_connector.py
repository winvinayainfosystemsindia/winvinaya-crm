from __future__ import annotations
"""End-to-end tests for the WinVinaya MIS Claude MCP Connector (Streamable HTTP + OAuth 2.1)."""

import json
from datetime import date, datetime
from urllib.parse import parse_qs, urlparse

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.mcp_server.auth.tokens import compute_pkce_s256_challenge
from app.mcp_server.db import get_mcp_auth_db, get_mcp_ro_db
from app.mcp_server.main import app as mcp_app
from app.models.candidate import Candidate
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_screening import CandidateScreening
from app.models.company import Company, CompanyStatus
from app.models.contact import Contact
from app.models.job_role import JobRole, JobRoleStatus
from app.models.mcp_oauth import MCPAuditLog
from app.models.placement_mapping import PlacementMapping, PlacementStatus
from app.models.training_attendance import TrainingAttendance
from app.models.training_batch import TrainingBatch
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.user import User, UserRole


@pytest.fixture
async def mcp_client(db_session: AsyncSession):
    """Test client bound to the standalone MCP FastAPI app with overridden DB sessions."""

    async def _override_db():
        yield db_session

    mcp_app.dependency_overrides[get_mcp_ro_db] = _override_db
    mcp_app.dependency_overrides[get_mcp_auth_db] = _override_db

    async with AsyncClient(app=mcp_app, base_url="https://crm.winvinaya.com") as ac:
        yield ac

    mcp_app.dependency_overrides.clear()


@pytest.fixture
async def seeded_users(db_session: AsyncSession) -> dict[str, User]:
    """Create an Admin user and a non-admin (Placement) user."""
    admin = User(
        email="admin@winvinaya.com",
        username="wvadmin",
        full_name="WinVinaya Admin",
        hashed_password=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
        is_superuser=False,
    )
    placement_user = User(
        email="placement@winvinaya.com",
        username="wvplacement",
        full_name="Placement Staff",
        hashed_password=get_password_hash("PlacePass123!"),
        role=UserRole.PLACEMENT,
        is_active=True,
        is_verified=True,
        is_superuser=False,
    )
    db_session.add_all([admin, placement_user])
    await db_session.commit()
    await db_session.refresh(admin)
    await db_session.refresh(placement_user)
    return {"admin": admin, "placement": placement_user}


@pytest.fixture
async def seeded_mis_data(db_session: AsyncSession, seeded_users: dict[str, User]):
    """Seed representative MIS records (candidates, screening, batch, attendance, job role, pipeline)."""
    c1 = Candidate(
        name="Aarav Kumar",
        gender="Male",
        email="aarav@example.com",
        phone="9876543210",
        pincode="560001",
        city="Bengaluru",
        district="Bengaluru Urban",
        state="Karnataka",
        disability_details={"is_disabled": True, "disability_type": "Locomotor Disability"},
        education_details={"degrees": [{"degree_name": "B.Tech"}]},
        work_experience={"is_experienced": False},
    )
    c2 = Candidate(
        name="Divya Sharma",
        gender="Female",
        email="divya@example.com",
        phone="9876500000",
        pincode="600001",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        disability_details={"is_disabled": True, "disability_type": "Hearing Impairment"},
        education_details={"degrees": [{"degree_name": "B.Com"}]},
        work_experience={"is_experienced": True},
    )
    db_session.add_all([c1, c2])
    await db_session.flush()

    scr1 = CandidateScreening(
        candidate_id=c1.id,
        status="Selected",
        consent_status="Accepted",
        screened_by_id=seeded_users["admin"].id,
    )
    coun1 = CandidateCounseling(
        candidate_id=c1.id,
        status="selected",
        counselor_name="Admin Counselor",
        feedback="Strong analytical aptitude",
    )
    batch = TrainingBatch(
        batch_name="Python & Data Analytics Batch 1",
        status="running",
        disability_types=["Locomotor Disability", "Hearing Impairment"],
        start_date=date(2026, 10, 1),
    )
    db_session.add_all([scr1, coun1, batch])
    await db_session.flush()

    alloc1 = TrainingCandidateAllocation(
        batch_id=batch.id,
        candidate_id=c1.id,
        status="in_training",
        is_dropout=False,
    )
    alloc2 = TrainingCandidateAllocation(
        batch_id=batch.id,
        candidate_id=c2.id,
        status="in_training",
        is_dropout=False,
    )
    # c1 has 100% attendance (2/2), c2 has 50% attendance (1/2 -> below 75%)
    att_records = [
        TrainingAttendance(batch_id=batch.id, candidate_id=c1.id, date=date(2026, 10, 2), status="present"),
        TrainingAttendance(batch_id=batch.id, candidate_id=c1.id, date=date(2026, 10, 3), status="present"),
        TrainingAttendance(batch_id=batch.id, candidate_id=c2.id, date=date(2026, 10, 2), status="present"),
        TrainingAttendance(batch_id=batch.id, candidate_id=c2.id, date=date(2026, 10, 3), status="absent"),
    ]
    comp = Company(
        name="TechInclusion Pvt Ltd",
        industry="IT Services",
        status=CompanyStatus.ACTIVE,
    )
    db_session.add_all([alloc1, alloc2, *att_records, comp])
    await db_session.flush()

    contact = Contact(
        company_id=comp.id,
        first_name="Riya",
        last_name="Menon",
        email="riya@techinclusion.example.com",
    )
    db_session.add(contact)
    await db_session.flush()

    jr = JobRole(
        title="Junior Data Analyst",
        company_id=comp.id,
        contact_id=contact.id,
        status=JobRoleStatus.ACTIVE,
        no_of_vacancies=3,
    )
    db_session.add(jr)
    await db_session.flush()

    pm = PlacementMapping(
        candidate_id=c1.id,
        job_role_id=jr.id,
        mapped_by_id=seeded_users["admin"].id,
        status=PlacementStatus.INTERVIEW_L1,
        match_score=88.5,
        is_active=True,
        mapped_at=datetime.utcnow(),
    )
    db_session.add(pm)
    await db_session.commit()
    return {"c1": c1, "c2": c2, "batch": batch, "company": comp, "job_role": jr}


async def _complete_oauth_for_admin(mcp_client: AsyncClient) -> dict[str, str]:
    """Helper that performs DCR + /mcp/authorize + /mcp/token for admin@winvinaya.com."""
    redirect_uri = "https://claude.ai/api/mcp/auth_callback"
    reg_resp = await mcp_client.post(
        "/mcp/register",
        json={
            "client_name": "Claude Web",
            "redirect_uris": [redirect_uri],
            "grant_types": ["authorization_code", "refresh_token"],
            "response_types": ["code"],
            "token_endpoint_auth_method": "none",
        },
    )
    assert reg_resp.status_code == 201
    client_id = reg_resp.json()["client_id"]

    verifier = "test-pkce-code-verifier-1234567890-abcdef"
    challenge = compute_pkce_s256_challenge(verifier)

    auth_resp = await mcp_client.post(
        "/mcp/authorize",
        data={
            "email": "admin@winvinaya.com",
            "password": "AdminPass123!",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": "xyz-state",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "scope": "mcp:read",
            "resource": "https://crm.winvinaya.com/mcp",
        },
        follow_redirects=False,
    )
    assert auth_resp.status_code == 302
    loc = auth_resp.headers["location"]
    qs = parse_qs(urlparse(loc).query)
    assert qs["state"] == ["xyz-state"]
    code = qs["code"][0]

    tok_resp = await mcp_client.post(
        "/mcp/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "code_verifier": verifier,
        },
    )
    assert tok_resp.status_code == 200
    tok_json = tok_resp.json()
    tok_json["client_id"] = client_id
    return tok_json


@pytest.mark.asyncio
async def test_unauthenticated_mcp_returns_401_and_discovery_metadata(mcp_client: AsyncClient):
    # 1. Hitting /mcp without a token returns 401 + WWW-Authenticate
    r = await mcp_client.post("/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "ping"})
    assert r.status_code == 401
    www_auth = r.headers.get("www-authenticate", "")
    assert "/.well-known/oauth-protected-resource/mcp" in www_auth

    # 2. Protected resource metadata
    pr = await mcp_client.get("/.well-known/oauth-protected-resource/mcp")
    assert pr.status_code == 200
    assert pr.json()["resource"] == "https://crm.winvinaya.com/mcp"

    # 3. Authorization server metadata
    as_meta = await mcp_client.get("/.well-known/oauth-authorization-server/mcp")
    assert as_meta.status_code == 200
    meta = as_meta.json()
    assert meta["authorization_endpoint"] == "https://crm.winvinaya.com/mcp/authorize"
    assert meta["token_endpoint"] == "https://crm.winvinaya.com/mcp/token"
    assert meta["registration_endpoint"] == "https://crm.winvinaya.com/mcp/register"
    assert "S256" in meta["code_challenge_methods_supported"]


@pytest.mark.asyncio
async def test_dcr_rejects_untrusted_redirect_uri(mcp_client: AsyncClient):
    r = await mcp_client.post(
        "/mcp/register",
        json={
            "client_name": "Evil Client",
            "redirect_uris": ["https://evil.example.com/callback"],
        },
    )
    assert r.status_code == 400
    assert r.json()["error"] == "invalid_redirect_uri"


@pytest.mark.asyncio
async def test_non_admin_user_rejected_at_login(
    mcp_client: AsyncClient,
    seeded_users: dict[str, User],
):
    redirect_uri = "https://claude.ai/api/mcp/auth_callback"
    reg = await mcp_client.post(
        "/mcp/register",
        json={"client_name": "Claude", "redirect_uris": [redirect_uri]},
    )
    client_id = reg.json()["client_id"]
    challenge = compute_pkce_s256_challenge("verifier-1234567890")

    resp = await mcp_client.post(
        "/mcp/authorize",
        data={
            "email": "placement@winvinaya.com",
            "password": "PlacePass123!",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "state": "s1",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        },
    )
    assert resp.status_code == 403
    assert "Access restricted to administrators" in resp.text


@pytest.mark.asyncio
async def test_full_mcp_lifecycle_tools_resources_prompts_and_audit(
    mcp_client: AsyncClient,
    db_session: AsyncSession,
    seeded_users: dict[str, User],
    seeded_mis_data: dict,
):
    tokens = await _complete_oauth_for_admin(mcp_client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    # 1. initialize
    init_res = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": "2025-03-26", "capabilities": {}, "clientInfo": {"name": "claude"}},
        },
    )
    assert init_res.status_code == 200
    assert "Mcp-Session-Id" in init_res.headers
    assert init_res.json()["result"]["protocolVersion"] == "2025-03-26"

    # 2. notifications/initialized -> 202 Accepted
    notif_res = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={"jsonrpc": "2.0", "method": "notifications/initialized"},
    )
    assert notif_res.status_code == 202

    # 3. tools/list -> only read-only tools exposed, write tools excluded
    list_res = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
    )
    assert list_res.status_code == 200
    tools = list_res.json()["result"]["tools"]
    tool_names = {t["name"] for t in tools}
    assert "get_mis_dashboard" in tool_names
    assert "search_candidates" in tool_names
    assert "get_candidate_analytics" in tool_names
    assert "get_candidate_profile" in tool_names
    assert "get_batch_attendance" in tool_names
    assert "get_job_role_pipeline" in tool_names
    # Write tools MUST NOT be present
    assert "create_lead" not in tool_names
    assert "create_job_role" not in tool_names
    assert all(t["annotations"]["readOnlyHint"] is True for t in tools)

    # 4. Calling a write tool directly via tools/call is blocked
    write_attempt = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "create_lead",
                "arguments": {"title": "Test", "company_name": "X", "contact_name": "Y"},
            },
        },
    )
    assert write_attempt.status_code == 200
    assert write_attempt.json()["result"]["isError"] is True

    # 5. Call get_mis_dashboard
    dash_call = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "get_mis_dashboard", "arguments": {}}},
    )
    dash_payload = json.loads(dash_call.json()["result"]["content"][0]["text"])
    assert dash_payload["success"] is True
    assert dash_payload["data"]["candidates_registered"] == 2
    assert dash_payload["data"]["screening"]["total_screened"] == 1

    # 6. Call get_batch_attendance (verifies low-attendance detection < 75%)
    att_call = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {"name": "get_batch_attendance", "arguments": {"min_attendance_pct": 75}},
        },
    )
    att_payload = json.loads(att_call.json()["result"]["content"][0]["text"])
    assert att_payload["success"] is True
    low_cands = att_payload["data"]["low_attendance_candidates"]
    assert len(low_cands) == 1
    assert low_cands[0]["candidate_name"] == "Divya Sharma"
    assert low_cands[0]["attendance_pct"] == 50.0

    # 7. Call get_job_role_pipeline
    pipe_call = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={
            "jsonrpc": "2.0",
            "id": 6,
            "method": "tools/call",
            "params": {"name": "get_job_role_pipeline", "arguments": {"title": "Junior Data Analyst"}},
        },
    )
    pipe_payload = json.loads(pipe_call.json()["result"]["content"][0]["text"])
    assert pipe_payload["success"] is True
    assert pipe_payload["data"]["total_active_candidates"] == 1
    assert pipe_payload["data"]["candidates"][0]["candidate_name"] == "Aarav Kumar"

    # 8. Resources & Prompts
    res_read = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={"jsonrpc": "2.0", "id": 7, "method": "resources/read", "params": {"uri": "mis://schema/glossary"}},
    )
    assert res_read.status_code == 200
    assert "placement_pipeline_stages" in res_read.json()["result"]["contents"][0]["text"]

    prompt_get = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={
            "jsonrpc": "2.0",
            "id": 8,
            "method": "prompts/get",
            "params": {"name": "placement_pipeline_review", "arguments": {"job_role": "Junior Data Analyst"}},
        },
    )
    assert prompt_get.status_code == 200
    assert "Junior Data Analyst" in prompt_get.json()["result"]["messages"][0]["content"]["text"]

    # 9. Verify audit logs were written
    audit_rows = (await db_session.execute(select(MCPAuditLog))).scalars().all()
    assert len(audit_rows) >= 4
    logged_tools = {a.tool_name for a in audit_rows}
    assert {"create_lead", "get_mis_dashboard", "get_batch_attendance", "get_job_role_pipeline"} <= logged_tools

    # 10. Refresh token rotation & revocation
    rot_res = await mcp_client.post(
        "/mcp/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": tokens["refresh_token"],
            "client_id": tokens["client_id"],
        },
    )
    assert rot_res.status_code == 200
    new_access = rot_res.json()["access_token"]

    # Old access token is now revoked
    old_check = await mcp_client.post(
        "/mcp",
        headers=headers,
        json={"jsonrpc": "2.0", "id": 9, "method": "ping"},
    )
    assert old_check.status_code == 401

    # Revoke the new access token and confirm immediate block
    await mcp_client.post("/mcp/revoke", data={"token": new_access})
    revoked_check = await mcp_client.post(
        "/mcp",
        headers={"Authorization": f"Bearer {new_access}"},
        json={"jsonrpc": "2.0", "id": 10, "method": "ping"},
    )
    assert revoked_check.status_code == 401

