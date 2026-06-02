"""Add cost_price to products

Revision ID: 004
Revises: 003
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("cost_price", sa.Float(), nullable=True, server_default="0.0"),
    )


def downgrade() -> None:
    op.drop_column("products", "cost_price")
