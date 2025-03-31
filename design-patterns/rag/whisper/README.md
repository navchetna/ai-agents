# Whisper Speech-to-Text Service

This service provides speech-to-text functionality for the RAG application using OpenAI's Whisper model.

## Setup

1. Install ffmpeg (required for Whisper to process audio):

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y ffmpeg

# CentOS/RHEL
sudo yum install -y ffmpeg

# macOS (using Homebrew)
brew install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg
```

2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Set environment variables (optional):

```bash
# Model size (tiny, base, small, medium, large)
export WHISPER_MODEL_SIZE=base  
# Port for the service
export WHISPER_SERVICE_PORT=8765  
```

4. Run the service:

```bash
python service.py
```

## API Endpoints

### Transcribe Audio

**Endpoint**: `POST /api/transcribe`

**Request**: Form data with a file field containing the audio file (supports mp3, wav, m4a, ogg, webm)

**Response**:
```json
{
  "text": "Transcribed text content",
  "processing_time": 1.234,
  "model": "base"
}
```

## Integration with Main Application

The service is integrated with the main RAG application through the `/api/transcribe` endpoint which forwards requests to this Whisper service. The AudioRecorder component in the UI enables users to record audio and get real-time transcriptions directly in the chat interface. 