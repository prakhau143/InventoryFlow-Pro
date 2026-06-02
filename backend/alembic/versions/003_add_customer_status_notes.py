"""Add is_active, notes, updated_at to customers

Revision ID: 003
Revises: 002
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("customers", sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"))
    op.add_column("customers", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True,
                                         server_default=sa.func.now()))


def downgrade() -> None:
    op.drop_column("customers", "updated_at")
    op.drop_column("customers", "is_active")
    op.drop_column("customers", "notes")
