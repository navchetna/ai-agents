from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
import fitz  # PyMuPDF
import json
import os
import uuid

app = FastAPI(
    title="PDF Highlighter API",
    description="API for highlighting multiple texts in PDFs with metadata tracking",
    version="2.0"
)

# Configuration
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "output"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

COLOR_MAP = {
    "red": (1, 0, 0),
    "green": (0, 1, 0),
    "blue": (0, 0, 1),
    "yellow": (1, 1, 0),
    "magenta": (1, 0, 1),
    "cyan": (0, 1, 1),
    "purple": (0.5, 0, 0.5),
    "orange": (1, 0.5, 0),
    "pink": (1, 0.7, 0.9),
    "teal": (0, 0.5, 0.5)
}

def highlight_pdf(file_path, search_texts, colors=None, processing_id=None):
    try:
        doc = fitz.open(file_path)
        highlights = []
        default_colors = list(COLOR_MAP.values())
        highlight_colors = colors or default_colors

        for idx, text in enumerate(search_texts):
            search_phrase = text.strip()
            if not search_phrase:
                continue

            color = highlight_colors[idx % len(highlight_colors)]
            phrase_words = search_phrase.split()
            phrase_len = len(phrase_words)

            for page_num in range(len(doc)):
                page = doc[page_num]
                words = page.get_text("words")
                matches = []

                for i in range(len(words) - phrase_len + 1):
                    match = True
                    for j in range(phrase_len):
                        if words[i + j][4].strip().lower() != phrase_words[j].strip().lower():
                            match = False
                            break

                    if match:
                        bboxes = [words[i + j][:4] for j in range(phrase_len)]
                        line_positions = [b[1] for b in bboxes]
                        unique_lines = list(set(line_positions))

                        if len(unique_lines) > 1:
                            for bbox in bboxes:
                                rect = fitz.Rect(*bbox)
                                annot = page.add_highlight_annot(rect)
                                annot.set_colors(stroke=color)
                                annot.update()
                                matches.append(rect)
                        else:
                            x0 = min(b[0] for b in bboxes)
                            y0 = min(b[1] for b in bboxes)
                            x1 = max(b[2] for b in bboxes)
                            y1 = max(b[3] for b in bboxes)
                            combined_rect = fitz.Rect(x0, y0, x1, y1)
                            annot = page.add_highlight_annot(combined_rect)
                            annot.set_colors(stroke=color)
                            annot.update()
                            matches.append(combined_rect)

                if matches:
                    highlights.append({
                        "group": f"Highlight {idx+1}",
                        "text": text,
                        "page": page_num + 1,
                        "color": color,
                        "coordinates": [[rect.x0, rect.y0, rect.x1, rect.y1] for rect in matches]
                    })

        output_path = os.path.join(OUTPUT_FOLDER, f"{processing_id}.pdf")
        doc.save(output_path)
        doc.close()

        metadata_path = os.path.join(OUTPUT_FOLDER, f"{processing_id}.json")
        with open(metadata_path, "w") as f:
            json.dump(highlights, f, indent=4)

        return output_path

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing error: {str(e)}")

@app.post("/highlight", summary="Process PDF with multiple highlights")
async def process_pdf(
    file: UploadFile = File(..., description="PDF file to process"),
    search_texts: str = Form(..., description="Pipe-separated phrases (e.g., 'hello|world')"),
    colors: str = Form(None, description="Comma-separated colors (e.g., 'red,blue')")
):
    try:
        processing_id = str(uuid.uuid4())
        
        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, f"{processing_id}.pdf")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Empty file uploaded")
            buffer.write(content)

        # Process search terms
        search_terms = [t.strip() for t in search_texts.split("|") if t.strip()]
        if not search_terms:
            raise HTTPException(status_code=400, detail="No valid search terms provided")

        # Process colors
        parsed_colors = []
        if colors:
            color_inputs = [c.strip().lower() for c in colors.split(",")]
            parsed_colors = [COLOR_MAP.get(c, (1, 1, 0)) for c in color_inputs]

        # Process PDF
        highlight_pdf(file_path, search_terms, parsed_colors, processing_id)

        return {
            "message": "PDF processed successfully",
            "processing_id": processing_id,
            "download_url": f"/download/{processing_id}",
            "metadata_url": f"/metadata/{processing_id}"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{processing_id}", summary="Download highlighted PDF")
async def download_pdf(processing_id: str):
    try:
        highlighted_pdf_path = os.path.join(OUTPUT_FOLDER, f"{processing_id}.pdf")
        if not os.path.exists(highlighted_pdf_path):
            raise HTTPException(status_code=404, detail="Processed file not found")
            
        return FileResponse(
            highlighted_pdf_path,
            media_type='application/pdf',
            filename=f"highlighted_{processing_id}.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metadata/{processing_id}", summary="Get highlight metadata")
async def get_metadata(processing_id: str):
    try:
        metadata_path = os.path.join(OUTPUT_FOLDER, f"{processing_id}.json")
        if not os.path.exists(metadata_path):
            raise HTTPException(status_code=404, detail="Metadata not found")
        
        with open(metadata_path, "r") as f:
            metadata = json.load(f)
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", include_in_schema=False)
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)