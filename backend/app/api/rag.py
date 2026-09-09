import os
import json
from urllib.parse import quote, unquote
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Module, Material, DocumentChunk, Lesson, AIQuestion
from app.services.rag_service import RAGService
from app.config import settings

def build_file_url(file_path_or_name: str) -> str:
    """Build URL-safe static file URL without double-encoding."""
    base_name = os.path.basename(file_path_or_name)
    raw_name = unquote(base_name)
    return f"http://localhost:8000/uploads/{quote(raw_name)}"

def enrich_slides_with_images(slides: list, file_path: str) -> list:
    """Ensure slide objects contain exact visual image_url pointing to slide-XX.png files."""
    if not file_path:
        return slides or []
    import glob
    filename = unquote(os.path.basename(file_path))
    base_no_ext = os.path.splitext(filename)[0]
    slides_dir_name = f"slides_{base_no_ext}"
    slides_dir = os.path.join(settings.UPLOAD_DIR, slides_dir_name)
    
    if os.path.exists(slides_dir):
        image_files = sorted(glob.glob(os.path.join(slides_dir, "slide-*.png")))
        if not image_files:
            image_files = sorted(glob.glob(os.path.join(slides_dir, "*.png")))
            
        if image_files:
            if not slides:
                slides = [{"page": i + 1, "title": f"Slide {i + 1}", "bullets": []} for i in range(len(image_files))]
                
            for idx, s in enumerate(slides):
                if idx < len(image_files):
                    f_name = os.path.basename(image_files[idx])
                    s["image_url"] = f"http://localhost:8000/uploads/{quote(slides_dir_name)}/{quote(f_name)}"
    return slides or []

router = APIRouter(prefix="/rag", tags=["RAG Services"])

class AskAssistantRequest(BaseModel):
    module_id: Optional[int] = None
    query: str

class GenerateNotesRequest(BaseModel):
    module_id: int
    topic: str

class GenerateAssignmentRequest(BaseModel):
    module_id: int
    topic: str
    num_questions: int = 3

@router.post("/ingest")
async def ingest_document(
    module_id: int = Form(...),
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"mod_{module_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    file_lower = file.filename.lower()
    is_pdf = file_lower.endswith(".pdf")
    is_ppt = "ppt" in file_lower
    file_type = "PDF" if is_pdf else ("PPT" if is_ppt else "DOCX")
    
    slides_data = []
    converted_pdf_url = None
    if is_ppt and file_lower.endswith(".pptx"):
        slides_data = RAGService.extract_slides_from_pptx(file_path)
        conversion_res = RAGService.convert_pptx_to_pdf_and_images(file_path, settings.UPLOAD_DIR)
        slide_images = conversion_res.get("slide_images", [])
        converted_pdf_url = conversion_res.get("pdf_url")
        for idx, s in enumerate(slides_data):
            if idx < len(slide_images):
                s["image_url"] = slide_images[idx]
            if converted_pdf_url:
                s["pdf_url"] = converted_pdf_url
    elif is_pdf:
        pdf_info = RAGService.extract_pdf_info(file_path)
        slides_data = pdf_info.get("slides", [])
        pdf_images = RAGService.convert_pdf_to_images(file_path, settings.UPLOAD_DIR)
        for idx, s in enumerate(slides_data):
            if idx < len(pdf_images):
                s["image_url"] = pdf_images[idx]
        
    extracted_text = RAGService.extract_text_from_file(file_path)
    if not extracted_text:
        extracted_text = f"Presentation slide deck for {file.filename} in {module.title}. Relational architecture, constraints, queries, and optimization."
        
    chunks = RAGService.chunk_text(extracted_text, chunk_size=500, overlap=50)
    
    # Accurate page count
    if slides_data:
        pages_count = len(slides_data)
    elif is_pdf:
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            pages_count = len(reader.pages)
        except Exception:
            pages_count = max(1, len(chunks))
    else:
        pages_count = max(1, len(chunks))
        
    file_url = build_file_url(saved_filename)
    material_title = title.strip() if (title and title.strip()) else file.filename

    # Save Material entry with clean saved_filename
    material = Material(
        module_id=module_id,
        title=material_title,
        file_type=file_type,
        file_path=saved_filename,
        content_text=extracted_text,
        description=description.strip() if (description and description.strip()) else None,
        pages_count=pages_count,
        slides_json=json.dumps(slides_data) if slides_data else None
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # Save Document Chunks with Page numbers
    for idx, c in enumerate(chunks):
        doc_chunk = DocumentChunk(
            material_id=material.id,
            chunk_text=c["text"],
            page_number=idx + 1
        )
        db.add(doc_chunk)

    # Add extracted slides as Lesson items
    paragraphs = [p.strip() for p in extracted_text.split("\n\n") if len(p.strip()) > 20]
    if not paragraphs and slides_data:
        paragraphs = [s.get("title", "") + ": " + ", ".join(s.get("bullets", [])) for s in slides_data]
    if not paragraphs:
        paragraphs = [c["text"] for c in chunks[:5]]
        
    for i, p in enumerate(paragraphs[:8]):
        slide_title = f"Slide {i+1}: {file.filename} - Part {i+1}"
        lesson = Lesson(
            module_id=module_id,
            title=slide_title,
            description=f"Uploaded Material ({file.filename})",
            content_type="NOTES",
            content_text=f"### {slide_title}\n\n{p}\n\nKey Concepts & Diagrammatic Breakdown included.",
            duration="10 mins",
            order=20 + i
        )
        db.add(lesson)

    db.commit()

    return {
        "message": f"Document '{file.filename}' successfully uploaded and ingested into Module '{module.code}'",
        "material_id": material.id,
        "filename": material.title,
        "file_url": file_url,
        "file_type": file_type,
        "pages_count": pages_count,
        "slides_count": len(slides_data),
        "chunks_count": len(chunks),
        "slides_created": min(8, len(paragraphs)),
        "slides": slides_data
    }

@router.get("/documents/{module_id}")
def get_module_documents(module_id: int, db: Session = Depends(get_db)):
    materials = db.query(Material).filter(Material.module_id == module_id).order_by(Material.id.desc()).all()
    result = []
    for m in materials:
        parsed_slides = []
        if m.slides_json:
            try:
                parsed_slides = json.loads(m.slides_json)
            except Exception:
                parsed_slides = []
        
        parsed_slides = enrich_slides_with_images(parsed_slides, m.file_path)
        file_url = build_file_url(m.file_path)
        
        # Check if converted PDF exists for PPT materials
        pdf_url = None
        base_no_ext = os.path.splitext(unquote(os.path.basename(m.file_path)))[0]
        candidate_pdf = f"{base_no_ext}.pdf"
        if os.path.exists(os.path.join(settings.UPLOAD_DIR, candidate_pdf)):
            pdf_url = build_file_url(candidate_pdf)
        elif parsed_slides and parsed_slides[0].get("pdf_url"):
            pdf_url = parsed_slides[0].get("pdf_url")

        result.append({
            "id": m.id,
            "module_id": m.module_id,
            "title": m.title,
            "description": m.description or "",
            "filename": os.path.basename(m.file_path),
            "file_type": m.file_type,
            "file_path": m.file_path,
            "file_url": file_url,
            "pdf_url": pdf_url,
            "pages_count": m.pages_count or (len(parsed_slides) if parsed_slides else 1),
            "slides": parsed_slides,
            "created_at": m.created_at.isoformat() if m.created_at else ""
        })
    return result

@router.get("/materials")
def get_all_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).order_by(Material.created_at.desc()).all()
    result = []
    for m in materials:
        parsed_slides = []
        if m.slides_json:
            try:
                parsed_slides = json.loads(m.slides_json)
            except Exception:
                parsed_slides = []
        
        parsed_slides = enrich_slides_with_images(parsed_slides, m.file_path)
        file_url = build_file_url(m.file_path)
        
        # Check if converted PDF exists for PPT materials
        pdf_url = None
        base_no_ext = os.path.splitext(unquote(os.path.basename(m.file_path)))[0]
        candidate_pdf = f"{base_no_ext}.pdf"
        if os.path.exists(os.path.join(settings.UPLOAD_DIR, candidate_pdf)):
            pdf_url = build_file_url(candidate_pdf)
        elif parsed_slides and parsed_slides[0].get("pdf_url"):
            pdf_url = parsed_slides[0].get("pdf_url")

        mod = db.query(Module).filter(Module.id == m.module_id).first()
        result.append({
            "id": m.id,
            "module_id": m.module_id,
            "module_code": mod.code if mod else f"MOD-{m.module_id}",
            "module_title": mod.title if mod else "Course Module",
            "title": m.title,
            "description": m.description or "",
            "filename": os.path.basename(m.file_path),
            "file_type": m.file_type,
            "file_path": m.file_path,
            "file_url": file_url,
            "pdf_url": pdf_url,
            "pages_count": m.pages_count or (len(parsed_slides) if parsed_slides else 1),
            "slides": parsed_slides,
            "created_at": m.created_at.isoformat() if m.created_at else ""
        })
    return result

@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    mat = db.query(Material).filter(Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # 1. Delete associated DocumentChunks
    db.query(DocumentChunk).filter(DocumentChunk.material_id == mat.id).delete()
    
    # 2. Update AIQuestions referencing this material
    db.query(AIQuestion).filter(AIQuestion.material_id == mat.id).update({"material_id": None})
    
    # 3. Remove Lessons generated from this material
    db.query(Lesson).filter(Lesson.module_id == mat.module_id, Lesson.description.like(f"%{mat.title}%")).delete(synchronize_session=False)

    # 4. Remove physical file if in uploads
    try:
        from urllib.parse import unquote
        raw_path = mat.file_path
        if "/uploads/" in raw_path:
            filename = unquote(raw_path.split("/uploads/")[-1])
            filepath = os.path.join(settings.UPLOAD_DIR, filename)
        else:
            filepath = os.path.abspath(raw_path)
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        print(f"Error removing file from disk: {e}")

    # 5. Delete Material record
    db.delete(mat)
    db.commit()

    return {"message": f"Material '{mat.title}' deleted successfully", "id": material_id}


@router.post("/ask-assistant")
def ask_ai_assistant(req: AskAssistantRequest, db: Session = Depends(get_db)):
    if req.module_id:
        materials = db.query(Material).filter(Material.module_id == req.module_id).all()
    else:
        materials = db.query(Material).all()

    all_chunks = []
    for mat in materials:
        db_chunks = db.query(DocumentChunk).filter(DocumentChunk.material_id == mat.id).all()
        for c in db_chunks:
            all_chunks.append({
                "text": c.chunk_text,
                "document": mat.title,
                "page": c.page_number
            })

    return RAGService.ask_ai_assistant(req.query, all_chunks)
