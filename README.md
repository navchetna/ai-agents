# Research Paper Assistant

# backend 

This project is a FastAPI-based application that allows users to search for research papers and get topic suggestions using the Semantic Scholar API.

## Features
- Search for research papers based on a query.
- Get suggestions for research topics based on partial input.
- Automatically generated interactive API documentation using Swagger UI.

## Prerequisites
- Python 3.7+
- Virtual environment (optional but recommended)

## Setup and Installation

### 1. Clone the Repository
```bash
THESE STEPS ARE TO RUN IT VIA DOCKER
1.git clone https://github.com/vaibhav071104/smart-research-project.git

2.cd  smart-research-project-main

3.docker build -t smart-research-project .

4.docker run -d -p 8000:8000 smart-research-project

5.You can access the automatically generated interactive API documentation at
 http://localhost:8000/docs

6.if you want to check  the processing in your terminal you can
docker logs <container_id>

7. after opening fast api refer to the the .txt file (api that can be used)
to explore different api for different endpoints

IF YOU WANT TO RUN IT LOCALLY (WITHOUT DOCKER)

1. cd smart-research-project-main

2.python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

3.pip install -r requirements.txt

4.uvicorn app:app --reload

5. Open your web browser and navigate to http://localhost:8000/docs

6.after opening fast api refer to the the .txt file (api that can be used)
to explore different api for different endpoints

## to install wsl 
1. Open PowerShell or Windows Command Prompt in administrator mode by right-clicking and selecting "Run as administrator"

2. wsl --install
