import json
import re
import math
from typing import List, Dict, Any
from PyPDF2 import PdfReader

class RAGService:
    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """Extract plain text from uploaded PDF, PPTX, or text file."""
        lower_path = file_path.lower()
        if lower_path.endswith('.pdf'):
            try:
                reader = PdfReader(file_path)
                text = ""
                for idx, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        text += f"\n--- Page {idx+1} ---\n" + extracted + "\n"
                return text.strip()
            except Exception as e:
                print(f"Error reading PDF: {e}")
                return ""
        elif lower_path.endswith('.pptx'):
            try:
                from pptx import Presentation
                prs = Presentation(file_path)
                text = ""
                for idx, slide in enumerate(prs.slides):
                    slide_title = ""
                    if slide.shapes.title and slide.shapes.title.text:
                        slide_title = slide.shapes.title.text.strip()
                    
                    slide_lines = []
                    for shape in slide.shapes:
                        if shape.has_text_frame and shape != slide.shapes.title:
                            for p in shape.text_frame.paragraphs:
                                p_text = p.text.strip()
                                if p_text:
                                    slide_lines.append(p_text)
                        elif shape.has_table:
                            for row in shape.table.rows:
                                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                                if row_text:
                                    slide_lines.append(row_text)

                    header = slide_title if slide_title else f"Slide {idx+1}"
                    text += f"\n--- Slide {idx+1}: {header} ---\n"
                    if slide_lines:
                        text += "\n".join(slide_lines) + "\n"
                return text.strip()
            except Exception as e:
                print(f"Error reading PPTX: {e}")
                return ""
        else:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read().strip()
            except Exception as e:
                print(f"Error reading text file: {e}")
                return ""

    @staticmethod
    def extract_slides_from_pptx(file_path: str) -> List[Dict[str, Any]]:
        """Extract structured slide data (title, bullets, tables, notes) from a PPTX file."""
        slides_data = []
        try:
            from pptx import Presentation
            prs = Presentation(file_path)
            for idx, slide in enumerate(prs.slides):
                slide_title = ""
                if slide.shapes.title and slide.shapes.title.text:
                    slide_title = slide.shapes.title.text.strip()

                bullets = []
                tables_data = []

                for shape in slide.shapes:
                    if shape.has_text_frame:
                        is_title_shape = (shape == slide.shapes.title)
                        for paragraph in shape.text_frame.paragraphs:
                            p_text = paragraph.text.strip()
                            if not p_text:
                                continue
                            if is_title_shape:
                                if not slide_title:
                                    slide_title = p_text
                            else:
                                bullets.append(p_text)
                    elif shape.has_table:
                        table_rows = []
                        for row in shape.table.rows:
                            row_cells = [cell.text.strip() for cell in row.cells]
                            table_rows.append(row_cells)
                        if table_rows:
                            tables_data.append(table_rows)

                # Slide notes
                notes_text = ""
                try:
                    if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                        notes_text = slide.notes_slide.notes_text_frame.text.strip()
                except Exception:
                    pass

                if not slide_title:
                    slide_title = f"Slide {idx + 1}"

                slides_data.append({
                    "page": idx + 1,
                    "title": slide_title,
                    "bullets": bullets,
                    "content": "\n\n".join(bullets) if bullets else f"Content details for {slide_title}",
                    "tables": tables_data,
                    "notes": notes_text
                })
        except Exception as e:
            print(f"Error extracting structured slides from PPTX: {e}")

        return slides_data

    @staticmethod
    def convert_pptx_to_pdf_and_images(pptx_path: str, upload_dir: str) -> Dict[str, Any]:
        """Convert PPTX to high-resolution PDF and slide images using macOS Keynote and pdftoppm."""
        import subprocess
        import os
        import glob
        from urllib.parse import quote

        base_name = os.path.splitext(os.path.basename(pptx_path))[0]
        pdf_name = f"{base_name}.pdf"
        pdf_path = os.path.join(upload_dir, pdf_name)
        slides_dir_name = f"slides_{base_name}"
        slides_dir = os.path.join(upload_dir, slides_dir_name)

        # 1. Convert to PDF using Keynote AppleScript
        try:
            abs_pptx = os.path.abspath(pptx_path)
            abs_pdf = os.path.abspath(pdf_path)
            apple_script = f'''
            set pptxPath to POSIX file "{abs_pptx}"
            set pdfPath to POSIX file "{abs_pdf}"
            tell application "Keynote"
                set theDoc to open pptxPath
                export theDoc to pdfPath as PDF with properties {{all stages:true}}
                close theDoc saving no
            end tell
            '''
            proc = subprocess.run(["osascript", "-e", apple_script], capture_output=True, text=True, timeout=60)
            if proc.returncode != 0:
                print(f"Keynote conversion warning: {proc.stderr}")
        except Exception as e:
            print(f"Error invoking Keynote export: {e}")

        # 2. Extract high-res PNG images for every slide
        slide_image_urls = []
        if os.path.exists(pdf_path):
            try:
                os.makedirs(slides_dir, exist_ok=True)
                pdftoppm_bin = "/opt/homebrew/bin/pdftoppm" if os.path.exists("/opt/homebrew/bin/pdftoppm") else "pdftoppm"
                subprocess.run([pdftoppm_bin, "-png", "-r", "150", pdf_path, os.path.join(slides_dir, "slide")], capture_output=True, timeout=60)
                
                png_files = sorted(glob.glob(os.path.join(slides_dir, "slide-*.png")))
                for f in png_files:
                    f_name = os.path.basename(f)
                    slide_image_urls.append(f"http://localhost:8000/uploads/{quote(slides_dir_name)}/{quote(f_name)}")
            except Exception as e:
                print(f"Error extracting slide images: {e}")

        has_pdf = os.path.exists(pdf_path)
        return {
            "pdf_name": pdf_name if has_pdf else None,
            "pdf_url": f"http://localhost:8000/uploads/{quote(pdf_name)}" if has_pdf else None,
            "slide_images": slide_image_urls
        }

    @staticmethod
    def convert_pdf_to_images(pdf_path: str, upload_dir: str) -> List[str]:
        """Extract high-resolution PNG images for every page of a PDF file using pdftoppm."""
        import subprocess
        import os
        import glob
        from urllib.parse import quote

        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        slides_dir_name = f"slides_{base_name}"
        slides_dir = os.path.join(upload_dir, slides_dir_name)
        os.makedirs(slides_dir, exist_ok=True)

        slide_image_urls = []
        try:
            pdftoppm_bin = "/opt/homebrew/bin/pdftoppm" if os.path.exists("/opt/homebrew/bin/pdftoppm") else "pdftoppm"
            subprocess.run([pdftoppm_bin, "-png", "-r", "150", pdf_path, os.path.join(slides_dir, "slide")], capture_output=True, timeout=60)
            
            png_files = sorted(glob.glob(os.path.join(slides_dir, "slide-*.png")))
            for f in png_files:
                f_name = os.path.basename(f)
                slide_image_urls.append(f"http://localhost:8000/uploads/{quote(slides_dir_name)}/{quote(f_name)}")
        except Exception as e:
            print(f"Error extracting PDF page images: {e}")

        return slide_image_urls

    @staticmethod
    def extract_pdf_info(file_path: str) -> Dict[str, Any]:
        """Extract total page count and basic structure from a PDF file."""
        try:
            reader = PdfReader(file_path)
            page_count = len(reader.pages)
            slides_data = []
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                lines = [l.strip() for l in text.split("\n") if l.strip()]
                title = lines[0][:80] if lines else f"Page {idx + 1}"
                bullets = lines[1:8] if len(lines) > 1 else lines
                slides_data.append({
                    "page": idx + 1,
                    "title": title,
                    "bullets": bullets,
                    "content": "\n".join(bullets)
                })
            return {"pages_count": page_count, "slides": slides_data}
        except Exception as e:
            print(f"Error extracting PDF info: {e}")
            return {"pages_count": 1, "slides": []}

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
        """Splits text into 500-token chunks with 50-token overlap for vector retrieval."""
        words = text.split()
        if not words:
            return []
        
        chunks = []
        i = 0
        chunk_id = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_text,
                "token_count": len(chunk_words)
            })
            chunk_id += 1
            i += (chunk_size - overlap)
            
        return chunks

    @staticmethod
    def compute_cosine_similarity(query: str, chunk_text: str) -> float:
        """Hybrid vector score combining n-gram term frequency cosine similarity & phrase matching over DBMS lecture decks."""
        q_clean = query.lower().strip()
        c_clean = chunk_text.lower().strip()
        
        if not q_clean or not c_clean:
            return 0.0

        q_words = re.findall(r'\w+', q_clean)
        c_words = re.findall(r'\w+', c_clean)
        
        if not q_words or not c_words:
            return 0.0

        q_tf = {}
        for w in q_words:
            if len(w) >= 2:
                q_tf[w] = q_tf.get(w, 0) + 1
        
        c_tf = {}
        for w in c_words:
            if len(w) >= 2:
                c_tf[w] = c_tf.get(w, 0) + 1

        if not q_tf or not c_tf:
            return 0.0

        dot_product = sum(q_tf[w] * c_tf.get(w, 0) for w in q_tf)
        q_norm = math.sqrt(sum(v ** 2 for v in q_tf.values()))
        c_norm = math.sqrt(sum(v ** 2 for v in c_tf.values()))

        base_score = 0.0
        if q_norm > 0 and c_norm > 0:
            base_score = dot_product / (q_norm * c_norm)

        # Bigram matching boost for multi-word DBMS concepts
        q_bigrams = set(zip(q_words[:-1], q_words[1:]))
        c_bigrams = set(zip(c_words[:-1], c_words[1:]))
        bigram_boost = 0.0
        if q_bigrams and c_bigrams:
            common_bigrams = q_bigrams.intersection(c_bigrams)
            bigram_boost = len(common_bigrams) * 0.25

        # Substring / Exact phrase boost
        exact_boost = 0.35 if q_clean in c_clean else 0.0

        return base_score + bigram_boost + exact_boost

    @classmethod
    def retrieve_top_chunks(cls, query: str, chunks: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """Retrieves top-k most relevant chunks with similarity scores."""
        if not chunks:
            return []
            
        scored = []
        for chunk in chunks:
            text = chunk.get("text", "")
            score = cls.compute_cosine_similarity(query, text)
            scored.append({
                "score": score,
                "text": text,
                "document": chunk.get("document", "DBMS_Module.pdf"),
                "page": chunk.get("page", 1)
            })
            
        scored.sort(key=lambda x: x["score"], reverse=True)
        top = [item for item in scored[:top_k] if item["score"] > 0]
        if not top:
            top = [
                {
                    "score": 0.5,
                    "text": c.get("text", ""),
                    "document": c.get("document", "DBMS_Module.pdf"),
                    "page": c.get("page", 1)
                } for c in chunks[:top_k]
            ]
        return top

    @classmethod
    def ask_ai_assistant(cls, query: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Answers student question using real-time Qwen 2.5 7B LLM with retrieved RAG context and exact citations."""
        import json
        import urllib.request
        from app.config import settings

        top_chunks = cls.retrieve_top_chunks(query, chunks, top_k=4)
        
        context_text = ""
        citations = []
        for item in top_chunks:
            context_text += f"\n--- Document: {item['document']} (Page/Slide {item['page']}) ---\n{item['text']}\n"
            citations.append({
                "document": item["document"],
                "page": item["page"],
                "snippet": item["text"][:150] + "..."
            })

        system_prompt = (
            "You are QueryHub AI, an expert Database Management Systems (DBMS) professor and tutor. "
            "Your goal is to answer the user's question clearly, accurately, and thoroughly with exact academic detail. "
            "Use the provided course material context when available. Explain concepts with clear key points, real-world database examples, and SQL syntax where relevant."
        )

        user_prompt = f"USER QUESTION: {query}\n\nCOURSE MATERIAL CONTEXT:\n{context_text if context_text.strip() else 'No specific course document chunk found.'}\n\nPlease provide a clear, accurate, and comprehensive answer."

        # 1. Try Groq API (Free Tier Qwen 2.5 / 3.2 Models) if GROQ_API_KEY is set
        try:
            from app.services.groq_service import GroqAIService
            groq_response = GroqAIService.call_groq_chat(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.3
            )
            if groq_response:
                return {
                    "query": query,
                    "answer": groq_response,
                    "citations": citations
                }
        except Exception as e:
            print(f"[Groq AI Notice]: {e}")

        try:
            # Query real-time Qwen 2.5 7B model via Ollama API (using Python standard library)
            req_data = json.dumps({
                "model": settings.OLLAMA_MODEL,
                "system": system_prompt,
                "prompt": user_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3
                }
            }).encode("utf-8")

            req = urllib.request.Request(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                data=req_data,
                headers={"Content-Type": "application/json"}
            )

            with urllib.request.urlopen(req, timeout=35.0) as resp:
                if resp.status == 200:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    ai_answer = resp_json.get("response", "").strip()
                    if ai_answer:
                        return {
                            "query": query,
                            "answer": ai_answer,
                            "citations": citations
                        }
        except Exception as e:
            print(f"[QueryHub AI Engine] Ollama Qwen 2.5 7B notice: {e}. Utilizing RAG Grounding Engine fallback.")

        # Fallback if Ollama is unreachable/busy
        if top_chunks:
            primary = top_chunks[0]
            answer = (
                f"Based on course material **{primary['document']}** (Page/Slide {primary['page']}):\n\n"
                f"{primary['text']}\n\n"
                f"• **Key DBMS Takeaway**: This principle ensures relational data integrity, schema consistency, and predictable performance under concurrent transactions."
            )
        else:
            answer = f"**QueryHub AI Analysis for '{query}'**:\n\nIn Database Management Systems (DBMS), relational data operations rely on structured schemas, ACID transactional guarantees, and efficient B+ Tree indexing to optimize query execution and ensure system reliability."

        return {
            "query": query,
            "answer": answer,
            "citations": citations
        }
