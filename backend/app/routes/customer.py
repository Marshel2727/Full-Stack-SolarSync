"""HTTP endpoints for customer."""
from fastapi import APIRouter, Depends
from app.routes.dependencies import admin_user
from app.utils.database import get_db
from app.service import customer as service

router = APIRouter(prefix="/api/v1", tags=["operations"])


@router.get("/admin/customer-accounts")
def customer_accounts(user=Depends(admin_user), db=Depends(get_db)):
    return service.customer_accounts(user, db)

@router.get("/admin/customers")
def customers(user=Depends(admin_user), db=Depends(get_db)):
    return service.customers(user, db)
