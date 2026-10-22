"""Optional, unique Google identity; existing accounts and ownership are preserved."""
from alembic import op
import sqlalchemy as sa

revision = "0003_google_identity"
down_revision = "0002_cache_epochs"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("google_subject", sa.String(255, collation="ascii_bin"), nullable=True))
    op.create_unique_constraint("uq_users_google_subject", "users", ["google_subject"])


def downgrade():
    op.drop_constraint("uq_users_google_subject", "users", type_="unique")
    op.drop_column("users", "google_subject")
