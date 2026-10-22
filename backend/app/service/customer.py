"""Customer directory queries."""
from sqlalchemy import select
from app.model.user import Customer, User


def customer_accounts(user, db):
    return [dict(id=str(account.id), name=account.name, email=account.email or "")
            for account in db.scalars(select(User).where(User.role == "customer",
                User.is_active.is_(True)).order_by(User.name, User.id))]

def customers(user, db):
    return [dict(id=str(c.id), customerCode=c.customer_code, name=c.name,
                 phone=c.phone, email=c.email, isActive=c.is_active)
            for c in db.scalars(select(Customer).order_by(Customer.id))]
