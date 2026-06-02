"""Add image/video to products + inventory_history table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("image_url", sa.String(500), nullable=True))
    op.add_column("products", sa.Column("video_url", sa.String(500), nullable=True))

    op.create_table(
        "inventory_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("change", sa.Integer(), nullable=False),
        sa.Column("previous_quantity", sa.Integer(), nullable=False),
        sa.Column("new_quantity", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(200), nullable=True),
        sa.Column("username", sa.String(50), nullable=True, default="system"),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_inventory_history_id"), "inventory_history", ["id"])
    op.create_index(op.f("ix_inventory_history_product_id"), "inventory_history", ["product_id"])


def downgrade() -> None:
    op.drop_table("inventory_history")
    op.drop_column("products", "video_url")
    op.drop_column("products", "image_url")
