from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import User, Profile, RoadmapGoal
from .deps import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Personalized Roadmap"])

class ToggleChecklistRequest(BaseModel):
    week_number: int
    item_id: str

@router.get("")
def get_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(RoadmapGoal).filter(RoadmapGoal.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not initialized")

    return {
        "title": roadmap.title,
        "badge": roadmap.badge,
        "description": roadmap.description,
        "currentWeek": roadmap.current_week,
        "totalWeeks": roadmap.total_weeks,
        "overallProgress": roadmap.overall_progress,
        "weeks": roadmap.weeks_data
    }

@router.post("/toggle")
def toggle_roadmap_checklist(
    req: ToggleChecklistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(RoadmapGoal).filter(RoadmapGoal.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    weeks = list(roadmap.weeks_data)
    updated_item_done = False

    for w in weeks:
        if w.get("week") == req.week_number:
            checklist = w.get("checklist", [])
            for item in checklist:
                if item.get("id") == req.item_id:
                    item["done"] = not item.get("done", False)
                    updated_item_done = item["done"]
                    break

            # If all checklist items done, mark week as completed
            if checklist and all(i.get("done") for i in checklist):
                w["completed"] = True
            elif checklist and not all(i.get("done") for i in checklist):
                w["completed"] = False
            break

    roadmap.weeks_data = weeks

    # Recalculate overall progress
    total_items = sum(len(w.get("checklist", [])) for w in weeks)
    done_items = sum(sum(1 for i in w.get("checklist", []) if i.get("done")) for w in weeks)
    if total_items > 0:
        roadmap.overall_progress = int((done_items / total_items) * 100)

    # Dynamic backend impact: updating roadmap updates Profile Readiness!
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        profile.readiness_score = min(99, max(60, int(70 + (roadmap.overall_progress * 0.28))))

    db.commit()
    db.refresh(roadmap)

    return {
        "status": "success",
        "item_id": req.item_id,
        "is_done": updated_item_done,
        "overall_progress": roadmap.overall_progress,
        "new_readiness_score": profile.readiness_score if profile else 86,
        "weeks": roadmap.weeks_data
    }
