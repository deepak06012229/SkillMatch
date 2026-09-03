from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User, SavedOpportunity, Opportunity
from .deps import get_current_user

router = APIRouter(prefix="/saved", tags=["Saved Opportunities"])

@router.get("")
def get_saved(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == current_user.id).all()
    saved_ids = [s.opportunity_id for s in saved]
    return {"saved_ids": saved_ids}

@router.post("/toggle/{opp_id}")
def toggle_saved(
    opp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id,
        SavedOpportunity.opportunity_id == opp_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "opp_id": opp_id, "is_saved": False}

    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    new_saved = SavedOpportunity(user_id=current_user.id, opportunity_id=opp_id)
    db.add(new_saved)
    db.commit()
    return {"status": "saved", "opp_id": opp_id, "is_saved": True}
