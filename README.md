# smart-research-project

# Research Paper Assistant

#  FRONTEND SETUP
Research Paper Search
A smart research paper search application built with Next.js and Tailwind CSS.

Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v14 or higher)
npm (v6 or higher)
Installation


1. Clone the repository:

git clone https://github.com/vaibhav071104/smart-research-project.git


cd smart-research-project-main




cd research-paper-search 2



2.npm install



3.npm install -D postcss-import postcss-nesting



4. npm run dev

   

5.FOR VIEWING THE SNOWBALLING REFERENCES YOU CAN COPY PASTE THE PAPER IDS WHICH CONSISTS OF LETTERS AND NUMBERS AT THE END OF THE URL OF THE PAPER

# FOR STARTING YOUR REDIS DB

1.cd  smart-research-project-main

2.sudo nano /etc/redis/redis.conf
# enter this 

bind 127.0.0.1



port 6379

3.sudo systemctl start redis

4. for checking the status 
 sudo systemctl status redis




# FOR VIEWING YOU CACHE STORED IN REDIS DB

1.cd  smart-research-project-main




2. docker exec -it redis redis-cli


3. 127.0.0.1:6379> KEYS *

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

3.source venv/bin/activate

4.docker compose build

5.docker compose up

6.You can access the automatically generated interactive API documentation at
 http://localhost:8000/docs

7. if you want to check  the processing in your terminal you can
docker logs <container_id>

8. after opening fast api refer to the the .txt file (api that can be used)
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


NAVIGATE TO RESEARCH-PAPER-SEARCH 2 FOR FRONTEND SETUP

