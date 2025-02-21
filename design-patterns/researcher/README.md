# smart-research-project

## Setup

### FRONTEND SETUP

      1.  Clone the repository:
      git clone https://github.com/vaibhav071104/ai-agents.git

      cd ai-agents/design-patterns/researcher/ui


      2.npm install 

      3. npm install -D postcss-import postcss-nesting

      4.npm run dev 

      5.FOR VIEWING THE SNOWBALLING REFERENCES YOU CAN COPY PASTE THE PAPER IDS WHICH CONSISTS OF LETTERS AND NUMBERS AT THE       END OF THE URL OF THE PAPER


  
### FOR STARTING UP YOUR REDIS DB

      1. cd ai-agents/design-patterns/researcher
      2. sudo nano /etc/redis/redis.conf
      3. THEN ENTER THIS 
         bind 127.0.0.1
         port 6379
      4.sudo systemctl start redis
      5.FOR CHECKING THE STATUS OF YOUR REDIS DB 
        sudo systemctl status redis


### FOR VIEWING YOUR CACHE STORED IN REDIS DB

     1.cd ai-agents/design-patterns/researcher
     2.docker exec -it redis redis-cli
     3. 127.0.0.1:6379> KEYS *

### BACKEND SETUP
This project is a FastAPI-based application that allows users to search for research papers and get topic suggestions using the Semantic Scholar API.

## Features
- Search for research papers based on a query.
- Get suggestions for research topics based on partial input.
- Automatically generated interactive API documentation using Swagger UI.

## Prerequisites
- Python 3.7+
- Virtual environment (optional but recommended)
```
     1.cd ai-agents/design-patterns/researcher
     2.source venv/bin/activate
     3.docker compose build
     4.docker compose up
     5.You can access the automatically generated interactive API documentation at
        http://localhost:8000/docs
        FOR EXAMPLE IF YOU WANT TO ACCESS THE DOWNLOAD_REFERENCES ENDPOINT YOU GO TO 
        http://localhost:8000/api/docs#/default/download_references_download_references_post
     6.after opening fast api refer to the the .txt file (api.txt)
     

```

```




