from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Module, Lesson

router = APIRouter(prefix="/modules", tags=["Modules"])

class LessonSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = ""
    content_type: str = "VIDEO"
    video_url: Optional[str] = ""
    content_text: Optional[str] = ""
    duration: Optional[str] = "12 mins"
    order: Optional[int] = 1

class ModuleCreateSchema(BaseModel):
    code: str
    title: str
    description: str
    lessons: List[LessonSchema] = []

@router.get("")
def get_all_modules(db: Session = Depends(get_db)):
    modules = db.query(Module).order_by(Module.order).all()
    result = []
    for m in modules:
        lessons = db.query(Lesson).filter(Lesson.module_id == m.id).order_by(Lesson.order).all()
        result.append({
            "id": m.id,
            "code": m.code,
            "title": m.title,
            "description": m.description,
            "order": m.order,
            "created_at": m.created_at.isoformat() if m.created_at else "",
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "description": l.description,
                    "content_type": l.content_type,
                    "video_url": l.video_url,
                    "content_text": l.content_text,
                    "duration": l.duration,
                    "order": l.order
                } for l in lessons
            ]
        })
    return result

@router.post("")
def create_module(data: ModuleCreateSchema, db: Session = Depends(get_db)):
    module = Module(
        code=data.code,
        title=data.title,
        description=data.description
    )
    db.add(module)
    db.commit()
    db.refresh(module)

    for i, l_data in enumerate(data.lessons):
        lesson = Lesson(
            module_id=module.id,
            title=l_data.title,
            description=l_data.description,
            content_type=l_data.content_type,
            video_url=l_data.video_url,
            content_text=l_data.content_text,
            duration=l_data.duration,
            order=i + 1
        )
        db.add(lesson)
    db.commit()
    return {"message": "Module created successfully", "module_id": module.id}

@router.delete("/{module_id}")
def delete_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()
    return {"message": "Module deleted"}
