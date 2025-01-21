# Groq for LLM service


## Setup


### Build image
```
cd ai-agents;
docker buildx build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy -t ai-agents/groq:latest -f comps/groq/Dockerfile  .;
```

### Run container

```
docker run -p 5099:8000 -e GROQ_API_KEY=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 -e http_proxy=$http_proxy -e https_proxy=$https_proxy ai-agents/groq:latest
```

