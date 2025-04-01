import os
import tempfile
import shutil
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import uvicorn
import numpy as np
import time
import torch

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
WHISPER_SERVICE_PORT = int(os.getenv("WHISPER_SERVICE_PORT", 8765))

app = FastAPI(title="Whisper Speech-to-Text Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_ffmpeg_installed():
    return shutil.which("ffmpeg") is not None

if not is_ffmpeg_installed():
    print("ERROR: ffmpeg is not installed or not in the PATH. Whisper requires ffmpeg to process audio files.")
    print("Please install ffmpeg and try again:")
    print("  - Ubuntu/Debian: sudo apt update && sudo apt install -y ffmpeg")
    print("  - CentOS/RHEL: sudo yum install -y ffmpeg")
    print("  - macOS: brew install ffmpeg")
    print("  - Windows: choco install ffmpeg")
    print("\nService will start but transcription will fail until ffmpeg is installed.")

try:
    print(f"Loading Whisper model: {WHISPER_MODEL_SIZE}")
    model = whisper.load_model(WHISPER_MODEL_SIZE)
    print("Whisper model loaded successfully")
except Exception as e:
    print(f"Error loading Whisper model: {str(e)}")
    print("Service will start but transcription may fail.")
    model = None

class TranscriptionResponse(BaseModel):
    text: str
    processing_time: float
    model: str

@app.get("/api/healthcheck")
async def healthcheck():
    """
    Check if the service is running and properly configured
    """
    issues = []
    if not is_ffmpeg_installed():
        issues.append("ffmpeg is not installed")
    
    if model is None:
        issues.append("Whisper model failed to load")
    
    if issues:
        return {
            "status": "unhealthy",
            "issues": issues,
            "message": "Service is running but will not function correctly until issues are resolved."
        }
    
    return {
        "status": "healthy",
        "model": WHISPER_MODEL_SIZE
    }

@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file using Whisper
    """
    start_time = time.time()
    
    if not is_ffmpeg_installed():
        raise HTTPException(
            status_code=500, 
            detail="ffmpeg is not installed. Please install ffmpeg to process audio files."
        )
    
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Whisper model failed to load. Please check the logs for more information."
        )
    
    if not file.filename.endswith(('.mp3', '.wav', '.m4a', '.ogg', '.webm')):
        raise HTTPException(400, "Unsupported file format. Supported formats: mp3, wav, m4a, ogg, webm")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
            contents = await file.read()
            temp.write(contents)
            temp_path = temp.name
            
        result = model.transcribe(temp_path)
        
        os.unlink(temp_path)
        
        processing_time = time.time() - start_time
        
        if not result["text"].strip():
            return TranscriptionResponse(
                text="No speech detected. Please check your audio or try speaking louder.",
                processing_time=processing_time,
                model=WHISPER_MODEL_SIZE
            )
        
        return TranscriptionResponse(
            text=result["text"].strip(),
            processing_time=processing_time,
            model=WHISPER_MODEL_SIZE
        )
    
    except Exception as e:
        if 'temp_path' in locals():
            try:
                os.unlink(temp_path)
            except:
                pass
        
        error_message = str(e)
        if "ffmpeg" in error_message.lower():
            error_message = "ffmpeg is not installed or not in the PATH. Please install ffmpeg to process audio files."
        
        raise HTTPException(500, f"Error processing audio: {error_message}")

if __name__ == "__main__":
    uvicorn.run(
        "service:app", 
        host="0.0.0.0", 
        port=WHISPER_SERVICE_PORT,
        log_level="info"
    ) 