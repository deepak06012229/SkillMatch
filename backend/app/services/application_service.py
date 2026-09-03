from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.entities import Application, ApplicationEvent, Opportunity, User
from ..schemas.all_schemas import ApplicationCreate, ApplicationStatusUpdate
from ..common.exceptions import NotFoundException, AppException

def list_student_applications(db: Session, user_id: str) -> List[Dict[str, Any]]:
    apps = db.query(Application).filter(Application.user_id == user_id).order_by(Application.created_at.desc()).all()
    results = []
    for a in apps:
        opp = a.opportunity
        events = [
            {
                "id": ev.id,
                "application_id": ev.application_id,
                "from_stage": ev.from_stage,
                "to_stage": ev.to_stage,
                "event_type": ev.event_type,
                "notes": ev.notes,
                "created_at": ev.created_at
            }
            for ev in (a.events or [])
        ]
        results.append({
            "id": a.id,
            "user_id": a.user_id,
            "opportunity_id": a.opportunity_id,
            "opportunityId": a.opportunity_id,
            "title": opp.title if opp else "Opportunity",
            "organization": opp.organization if opp else "Partner Organization",
            "logoText": opp.logo_text if opp else "SM",
            "logoBg": opp.logo_bg if opp else "bg-primary text-on-primary",
            "category": opp.category_label if opp else "Internship",
            "stage": a.stage,
            "status": a.status,
            "applied_date": a.applied_date,
            "appliedDate": a.applied_date,
            "last_updated": a.last_updated,
            "lastUpdated": a.last_updated,
            "next_action": a.next_action,
            "nextAction": a.next_action,
            "fit_score": a.fit_score,
            "fitScore": a.fit_score,
            "trust_score": a.trust_score,
            "trustScore": a.trust_score,
            "notes": a.notes,
            "events": events
        })
    return results

def submit_application(db: Session, user_id: str, data: ApplicationCreate) -> Dict[str, Any]:
    opp = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opp:
        raise NotFoundException("Opportunity", "The opportunity you are applying to does not exist.")

    existing = db.query(Application).filter(
        Application.user_id == user_id,
        Application.opportunity_id == data.opportunity_id
    ).first()

    if existing and existing.stage != "saved":
        raise AppException("ALREADY_APPLIED", "You have already submitted an application to this opportunity.")

    if existing and existing.stage == "saved":
        existing.stage = "applied"
        existing.status = "applied"
        existing.last_updated = "Just now"
        existing.next_action = "Application submitted and sent to hiring team"
        app = existing
    else:
        app = Application(
            user_id=user_id,
            opportunity_id=opp.id,
            status="applied",
            stage="applied",
            applied_date="Today",
            last_updated="Just now",
            next_action="Application submitted and sent to hiring team",
            notes=data.notes,
            fit_score=88,
            trust_score=opp.trust_score
        )
        db.add(app)
        db.flush()

    # Log application event
    event = ApplicationEvent(
        application_id=app.id,
        from_stage=None,
        to_stage="applied",
        event_type="created",
        notes=data.notes or "Initial application submitted via SkillMatch platform."
    )
    db.add(event)
    db.commit()
    db.refresh(app)

    return {
        "id": app.id,
        "opportunity_id": app.opportunity_id,
        "stage": app.stage,
        "status": app.status,
        "next_action": app.next_action,
        "message": f"Successfully applied to {opp.title} at {opp.organization}!"
    }

def update_application_stage(db: Session, user_id: str, app_id: str, data: ApplicationStatusUpdate) -> Dict[str, Any]:
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == user_id).first()
    if not app:
        raise NotFoundException("Application", "Application record not found.")

    old_stage = app.stage
    new_stage = data.status.lower()

    stage_actions = {
        "saved": "Saved in pipeline",
        "planning": "Reviewing requirements & customizing resume",
        "applied": "Awaiting employer review",
        "assessment": "Online coding assessment assigned",
        "interview": "Technical interview scheduled",
        "selected": "Offer received!",
        "rejected": "Application closed by organization",
        "withdrawn": "Withdrawn by candidate"
    }

    app.stage = new_stage
    app.status = new_stage
    app.last_updated = "Just now"
    app.next_action = stage_actions.get(new_stage, f"Status updated to {new_stage.title()}")
    if data.notes:
        app.notes = data.notes

    event = ApplicationEvent(
        application_id=app.id,
        from_stage=old_stage,
        to_stage=new_stage,
        event_type="stage_transition",
        notes=data.notes or f"Application transitioned from {old_stage} to {new_stage}."
    )
    db.add(event)
    db.commit()
    db.refresh(app)

    return {
        "id": app.id,
        "stage": app.stage,
        "status": app.status,
        "next_action": app.next_action,
        "last_updated": app.last_updated
    }
