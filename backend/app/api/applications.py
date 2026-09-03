from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User
from ..schemas.all_schemas import ApplicationCreate, ApplicationStatusUpdate, ApplicationOut
from ..services.application_service import list_student_applications, submit_application, update_application_stage
from .deps import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=List[ApplicationOut])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return list_student_applications(db, current_user.id)

@router.post("")
def apply_to_opportunity(
    req: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return submit_application(db, current_user.id, req)

@router.put("/{app_id}/status")
def update_application_status(
    app_id: str,
    req: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_application_stage(db, current_user.id, app_id, req)
