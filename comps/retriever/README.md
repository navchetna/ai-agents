# Retriever Component Setup
 
```
git clone https://github.com/navchetna/ai-agents && cd ai-agents
```
 
## Redis server

```
docker run -p 6379:6379 -p 8001:8001 redis/redis-stack:7.2.0-v9
```
 
## Dataprep server
 
### Build Dataprep image
```
docker buildx build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy -t ai-agents/retriever:latest -f comps/retriever/Dockerfile . 
``` 
 
### Run Dataprep container
```
docker run -p 5007:7000 -e http_proxy=$http_proxy -e https_proxy=$https_proxy -e HUGGINGFACEHUB_API_TOKEN=<token> -e REDIS_URL=redis://<redis-host-name>:6379 -v /root/.cache/huggingface/hub:/.cache/huggingface/hub ai-agents/retriever:latest
``` 

## Docker Compose setup for data prep component only

```
export REDIS_URL="redis://redis-vector-db:6379"
export HUGGINGFACEHUB_API_TOKEN=${your_hf_api_token}
docker compose -f comps/dataprep/redis_langchain.yaml up -d
```

## To check retival

```
export your_embedding=$(python3 -c "import random; embedding = [random.uniform(-1, 1) for _ in range(768)]; print(embedding)")
curl http://${host_ip}:5007/v1/retrieval \
  -X POST \
  -d "{\"text\":\"test\",\"embedding\":${your_embedding}}" \
  -H 'Content-Type: application/json'
```

> Note: for localsetup use localhost as host_ip