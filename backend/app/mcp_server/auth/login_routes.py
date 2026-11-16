from __future__ import annotations
"""OAuth 2.1 HTTP routes for the WinVinaya MIS Claude MCP Connector.

Serves:
- `GET /.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/mcp`
- `GET /.well-known/oauth-authorization-server` and `/.well-known/oauth-authorization-server/mcp`
- `POST /mcp/register` (Dynamic Client Registration)
- `GET /mcp/authorize` & `POST /mcp/authorize` (MIS Admin Login & Consent)
- `POST /mcp/token` (Token exchange & refresh rotation)
- `POST /mcp/revoke` (Token revocation)
"""

import html
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl

from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.mcp_server.auth.provider import (
    build_authorization_server_metadata,
    build_protected_resource_metadata,
    get_oauth_client,
    register_oauth_client,
)
from app.mcp_server.auth.tokens import (
    create_authorization_code,
    exchange_authorization_code,
    revoke_token,
    rotate_refresh_token,
)
from app.mcp_server.config import mcp_settings
from app.mcp_server.db import get_mcp_auth_db
from app.mcp_server.guard import is_user_allowed_mcp
from app.models.user import User

oauth_router = APIRouter(tags=["MCP OAuth 2.1"])


def _request_base_url(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme or "https"
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    return f"{proto}://{host}"


def _issuer_url(request: Request) -> str:
    return mcp_settings.issuer_for_request(_request_base_url(request))


def _render_login_html(
    *,
    client_id: str,
    redirect_uri: str,
    state: str,
    code_challenge: str,
    code_challenge_method: str,
    scope: str,
    resource: str,
    client_name: str = "Claude (claude.ai)",
    error_message: str | None = None,
) -> str:
    error_block = ""
    if error_message:
        error_block = (
            f'<div class="alert">{html.escape(error_message)}</div>'
        )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WinVinaya MIS — Connect to Claude</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f4f6f9;
      margin: 0;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      color: #1e293b;
    }}
    .card {{
      background: #ffffff;
      width: 100%;
      max-width: 420px;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }}
    .badge {{
      display: inline-block;
      background: #eef2ff;
      color: #3730a3;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 12px;
    }}
    h1 {{
      font-size: 20px;
      margin: 0 0 6px 0;
    }}
    p.sub {{
      font-size: 14px;
      color: #64748b;
      margin: 0 0 20px 0;
      line-height: 1.45;
    }}
    .alert {{
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }}
    label {{
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }}
    input[type="email"], input[type="password"] {{
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }}
    .scope-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12px;
      color: #475569;
      margin-bottom: 20px;
    }}
    button {{
      width: 100%;
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 11px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }}
    button:hover {{
      background: #1d4ed8;
    }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Read-Only MCP Connector</span>
    <h1>Sign in to WinVinaya MIS</h1>
    <p class="sub">
      Authorize <strong>{html.escape(client_name)}</strong> to read WinVinaya MIS metrics and records.
      Restricted to MIS Administrators.
    </p>
    {error_block}
    <form method="post" action="/mcp/authorize">
      <input type="hidden" name="client_id" value="{html.escape(client_id)}" />
      <input type="hidden" name="redirect_uri" value="{html.escape(redirect_uri)}" />
      <input type="hidden" name="state" value="{html.escape(state)}" />
      <input type="hidden" name="code_challenge" value="{html.escape(code_challenge)}" />
      <input type="hidden" name="code_challenge_method" value="{html.escape(code_challenge_method)}" />
      <input type="hidden" name="scope" value="{html.escape(scope)}" />
      <input type="hidden" name="resource" value="{html.escape(resource)}" />

      <label for="email">MIS Admin Email</label>
      <input id="email" name="email" type="email" required autocomplete="username" placeholder="admin@winvinaya.com" />

      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" />

      <div class="scope-box">
        <strong>Permissions requested:</strong><br/>
        • Read-only access to candidates, screening, training batches, placement pipelines, CRM &amp; DSR reports.<br/>
        • No data can be modified or deleted.
      </div>

      <button type="submit">Authorize &amp; Connect</button>
    </form>
  </div>
</body>
</html>"""


# ── 1. Well-Known Discovery Endpoints (RFC 9728 & RFC 8414) ─────────────────

@oauth_router.get("/.well-known/oauth-protected-resource")
@oauth_router.get("/.well-known/oauth-protected-resource/mcp")
@oauth_router.get("/mcp/.well-known/oauth-protected-resource")
async def oauth_protected_resource_metadata(request: Request) -> JSONResponse:
    return JSONResponse(build_protected_resource_metadata(_issuer_url(request)))


@oauth_router.get("/.well-known/oauth-authorization-server")
@oauth_router.get("/.well-known/oauth-authorization-server/mcp")
@oauth_router.get("/mcp/.well-known/oauth-authorization-server")
async def oauth_authorization_server_metadata(request: Request) -> JSONResponse:
    return JSONResponse(build_authorization_server_metadata(_issuer_url(request)))


# ── 2. Dynamic Client Registration (RFC 7591) ───────────────────────────────

@oauth_router.post("/mcp/register", status_code=status.HTTP_201_CREATED)
async def dynamic_client_registration(
    request: Request,
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> JSONResponse:
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "invalid_client_metadata", "error_description": "Invalid JSON body"},
        )

    try:
        client_info = await register_oauth_client(auth_db, payload)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=client_info)
    except ValueError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "invalid_redirect_uri", "error_description": str(e)},
        )


# ── 3. Authorization Endpoint (GET login form + POST credential check) ──────

@oauth_router.get("/mcp/authorize", response_class=HTMLResponse)
async def authorize_get(
    request: Request,
    response_type: str = "code",
    client_id: str = "",
    redirect_uri: str = "",
    state: str = "",
    code_challenge: str = "",
    code_challenge_method: str = "S256",
    scope: str = "mcp:read",
    resource: str = "",
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> HTMLResponse:
    if response_type != "code":
        return HTMLResponse("Unsupported response_type", status_code=status.HTTP_400_BAD_REQUEST)
    if not redirect_uri or not mcp_settings.is_redirect_uri_allowed(redirect_uri):
        return HTMLResponse("Invalid or disallowed redirect_uri", status_code=status.HTTP_400_BAD_REQUEST)
    if not code_challenge or code_challenge_method.upper() != "S256":
        return HTMLResponse("PKCE S256 code_challenge is required", status_code=status.HTTP_400_BAD_REQUEST)

    client_row = await get_oauth_client(auth_db, client_id)
    client_name = client_row.client_name if client_row and client_row.client_name else "Claude (claude.ai)"

    return HTMLResponse(
        _render_login_html(
            client_id=client_id,
            redirect_uri=redirect_uri,
            state=state,
            code_challenge=code_challenge,
            code_challenge_method=code_challenge_method,
            scope=scope,
            resource=resource,
            client_name=client_name,
        )
    )


@oauth_router.post("/mcp/authorize")
async def authorize_post(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    client_id: str = Form(...),
    redirect_uri: str = Form(...),
    state: str = Form(""),
    code_challenge: str = Form(...),
    code_challenge_method: str = Form("S256"),
    scope: str = Form("mcp:read"),
    resource: str = Form(""),
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
):
    if not redirect_uri or not mcp_settings.is_redirect_uri_allowed(redirect_uri):
        return HTMLResponse("Invalid or disallowed redirect_uri", status_code=status.HTTP_400_BAD_REQUEST)
    if not code_challenge or code_challenge_method.upper() != "S256":
        return HTMLResponse("PKCE S256 code_challenge is required", status_code=status.HTTP_400_BAD_REQUEST)

    stmt = select(User).where(
        func.lower(User.email) == email.strip().lower(),
        User.is_deleted == False,
    )
    user = (await auth_db.execute(stmt)).scalar_one_or_none()

    if user is None or not verify_password(password, user.hashed_password):
        return HTMLResponse(
            _render_login_html(
                client_id=client_id,
                redirect_uri=redirect_uri,
                state=state,
                code_challenge=code_challenge,
                code_challenge_method=code_challenge_method,
                scope=scope,
                resource=resource,
                error_message="Invalid email or password.",
            ),
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return HTMLResponse(
            _render_login_html(
                client_id=client_id,
                redirect_uri=redirect_uri,
                state=state,
                code_challenge=code_challenge,
                code_challenge_method=code_challenge_method,
                scope=scope,
                resource=resource,
                error_message="Your MIS account is inactive.",
            ),
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if not is_user_allowed_mcp(user):
        return HTMLResponse(
            _render_login_html(
                client_id=client_id,
                redirect_uri=redirect_uri,
                state=state,
                code_challenge=code_challenge,
                code_challenge_method=code_challenge_method,
                scope=scope,
                resource=resource,
                error_message="Access restricted to administrators.",
            ),
            status_code=status.HTTP_403_FORBIDDEN,
        )

    raw_code = await create_authorization_code(
        auth_db,
        client_id=client_id,
        user_id=user.id,
        redirect_uri=redirect_uri,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
        scope=scope or "mcp:read",
        resource=resource or _issuer_url(request),
    )

    parsed = urlparse(redirect_uri)
    q = dict(parse_qsl(parsed.query))
    q["code"] = raw_code
    if state:
        q["state"] = state
    target = urlunparse(parsed._replace(query=urlencode(q)))
    return RedirectResponse(url=target, status_code=status.HTTP_302_FOUND)


# ── 4. Token Endpoint (POST /mcp/token) ─────────────────────────────────────

@oauth_router.post("/mcp/token")
async def token_endpoint(
    request: Request,
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> JSONResponse:
    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        data = await request.json()
    else:
        form = await request.form()
        data = dict(form)

    grant_type = str(data.get("grant_type") or "")
    client_id = str(data.get("client_id") or "")
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        if grant_type == "authorization_code":
            code = str(data.get("code") or "")
            redirect_uri = str(data.get("redirect_uri") or "")
            code_verifier = str(data.get("code_verifier") or "")
            if not code or not code_verifier:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_request", "error_description": "Missing code or code_verifier"},
                )

            access_token, refresh_token, expires_in, scope = await exchange_authorization_code(
                auth_db,
                code=code,
                client_id=client_id,
                redirect_uri=redirect_uri,
                code_verifier=code_verifier,
                client_ip=client_ip,
                user_agent=user_agent,
            )
            return JSONResponse(
                content={
                    "access_token": access_token,
                    "token_type": "Bearer",
                    "expires_in": expires_in,
                    "refresh_token": refresh_token,
                    "scope": scope,
                },
                headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
            )

        elif grant_type == "refresh_token":
            refresh_token = str(data.get("refresh_token") or "")
            if not refresh_token:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "invalid_request", "error_description": "Missing refresh_token"},
                )
            access_token, new_refresh, expires_in, scope = await rotate_refresh_token(
                auth_db,
                refresh_token=refresh_token,
                client_id=client_id or None,
                client_ip=client_ip,
                user_agent=user_agent,
            )
            return JSONResponse(
                content={
                    "access_token": access_token,
                    "token_type": "Bearer",
                    "expires_in": expires_in,
                    "refresh_token": new_refresh,
                    "scope": scope,
                },
                headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
            )

        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "unsupported_grant_type", "error_description": f"Unsupported grant_type: {grant_type}"},
            )

    except ValueError as e:
        msg = str(e)
        err_code = "access_denied" if msg.startswith("access_denied") else "invalid_grant"
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": err_code, "error_description": msg},
        )


# ── 5. Token Revocation Endpoint (POST /mcp/revoke) ─────────────────────────

@oauth_router.post("/mcp/revoke")
async def revoke_endpoint(
    request: Request,
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> JSONResponse:
    content_type = (request.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        data = await request.json()
    else:
        form = await request.form()
        data = dict(form)

    token = str(data.get("token") or "")
    await revoke_token(auth_db, token)
    return JSONResponse(status_code=status.HTTP_200_OK, content={"revoked": True})

