"""Add MCP OAuth 2.1 and audit log tables

Revision ID: c8d4e5f6a1b2
Revises: a7f9c2e3b4d5
Create Date: 2026-11-16 16:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c8d4e5f6a1b2"
down_revision: Union[str, None] = "a7f9c2e3b4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "oauth_clients",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("client_id", sa.String(length=128), nullable=False),
        sa.Column("client_secret_hash", sa.String(length=255), nullable=True),
        sa.Column("client_name", sa.String(length=255), nullable=True),
        sa.Column("redirect_uris", sa.JSON(), nullable=False),
        sa.Column("grant_types", sa.JSON(), nullable=False),
        sa.Column("response_types", sa.JSON(), nullable=False),
        sa.Column("token_endpoint_auth_method", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_oauth_clients_id"), "oauth_clients", ["id"], unique=False)
    op.create_index(op.f("ix_oauth_clients_client_id"), "oauth_clients", ["client_id"], unique=True)
    op.create_index(op.f("ix_oauth_clients_is_deleted"), "oauth_clients", ["is_deleted"], unique=False)

    op.create_table(
        "oauth_auth_codes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code_hash", sa.String(length=128), nullable=False),
        sa.Column("client_id", sa.String(length=128), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("redirect_uri", sa.Text(), nullable=False),
        sa.Column("code_challenge", sa.String(length=255), nullable=False),
        sa.Column("code_challenge_method", sa.String(length=20), nullable=False),
        sa.Column("scope", sa.String(length=255), nullable=True),
        sa.Column("resource", sa.String(length=500), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_oauth_auth_codes_id"), "oauth_auth_codes", ["id"], unique=False)
    op.create_index(op.f("ix_oauth_auth_codes_code_hash"), "oauth_auth_codes", ["code_hash"], unique=True)
    op.create_index(op.f("ix_oauth_auth_codes_client_id"), "oauth_auth_codes", ["client_id"], unique=False)
    op.create_index(op.f("ix_oauth_auth_codes_user_id"), "oauth_auth_codes", ["user_id"], unique=False)
    op.create_index(op.f("ix_oauth_auth_codes_is_deleted"), "oauth_auth_codes", ["is_deleted"], unique=False)

    op.create_table(
        "oauth_tokens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("access_token_hash", sa.String(length=128), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=128), nullable=True),
        sa.Column("client_id", sa.String(length=128), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("scope", sa.String(length=255), nullable=True),
        sa.Column("resource", sa.String(length=500), nullable=True),
        sa.Column("access_expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("refresh_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("client_ip", sa.String(length=100), nullable=True),
        sa.Column("user_agent", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_oauth_tokens_id"), "oauth_tokens", ["id"], unique=False)
    op.create_index(op.f("ix_oauth_tokens_access_token_hash"), "oauth_tokens", ["access_token_hash"], unique=True)
    op.create_index(op.f("ix_oauth_tokens_refresh_token_hash"), "oauth_tokens", ["refresh_token_hash"], unique=True)
    op.create_index(op.f("ix_oauth_tokens_client_id"), "oauth_tokens", ["client_id"], unique=False)
    op.create_index(op.f("ix_oauth_tokens_user_id"), "oauth_tokens", ["user_id"], unique=False)
    op.create_index(op.f("ix_oauth_tokens_is_deleted"), "oauth_tokens", ["is_deleted"], unique=False)

    op.create_table(
        "mcp_audit_log",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("user_email", sa.String(length=255), nullable=True),
        sa.Column("tool_name", sa.String(length=128), nullable=False),
        sa.Column("parameters", sa.JSON(), nullable=True),
        sa.Column("row_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("success", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("client_ip", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_mcp_audit_log_id"), "mcp_audit_log", ["id"], unique=False)
    op.create_index(op.f("ix_mcp_audit_log_user_id"), "mcp_audit_log", ["user_id"], unique=False)
    op.create_index(op.f("ix_mcp_audit_log_user_email"), "mcp_audit_log", ["user_email"], unique=False)
    op.create_index(op.f("ix_mcp_audit_log_tool_name"), "mcp_audit_log", ["tool_name"], unique=False)
    op.create_index(op.f("ix_mcp_audit_log_is_deleted"), "mcp_audit_log", ["is_deleted"], unique=False)


def downgrade() -> None:
    op.drop_table("mcp_audit_log")
    op.drop_table("oauth_tokens")
    op.drop_table("oauth_auth_codes")
    op.drop_table("oauth_clients")

