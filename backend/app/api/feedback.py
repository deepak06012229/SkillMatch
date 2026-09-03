from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User, Feedback
from ..schemas.all_schemas import FeedbackCreate
from .deps import get_current_user

router = APIRouter(prefix="/feedback", tags=["Recommendation Feedback Loop"])

@router.post("")
def submit_feedback(
    req: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = Feedback(
        user_id=current_user.id,
        opportunity_id=req.opportunity_id,
        feedback_type=req.feedback_type,
        rating=req.rating,
        comments=req.comments
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"status": "success", "message": "Feedback recorded. Thank you!"}
