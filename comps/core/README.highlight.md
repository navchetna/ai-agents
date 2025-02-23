# PDF Highlighter

A FastAPI-based web app that highlights words in PDF document.

## Features
- Highlights multi-word phrases in PDFs
- Preserves original PDF formatting
- Handles punctuation as part of search terms
- Highlights multi line with "|" seperator 
- Generates combined highlights for phrases spanning multiple lines
- Exports highlighting metadata (positions, pages) in JSON format locally
- Download the highlighted pdf

## Installation

1. **Prerequisites**:
   - Python 3.7+
   - pip package manager

2. **Clone repository**:
   ```bash
   git clone https://github.com/tejjj02/pdf-highlighter.git
   cd pdf-highlighter
3. **Running the Application**:
   ```bash
   uvicorn app:app --reload

##  Optional UI

   4. **Web interface guide**:
      - Upload pdf
      - Enter the phrase to highlight
      - After processing, use the "Download Highlighted PDF" button
      - Access /get-metadata for highlight position data
##  API Documentation

### Endpoints

| Endpoint      | Method | Description                          | Parameters           |
|---------------|--------|--------------------------------------|----------------------|
| `/`           | `GET`  | Web interface for PDF upload         | -                    |
| `/highlight`  | `POST` | Process PDF and add highlights       | PDF file, search text |
| `/download`   | `GET`  | Download highlighted PDF             | -                    |
| `/get-metadata`| `GET`  | Retrieve highlight metadata (JSON)   | -                    |

