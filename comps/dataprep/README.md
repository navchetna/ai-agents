 # Dataprep Component Setup
 
```
git clone https://github.com/navchetna/ai-agents && cd ai-agents
```
 
## Redis server

```
docker run -p 6379:6379 -p 8001:8001 redis/redis-stack:7.2.0-v9
```
 
## Dataprep server
 
Build Dataprep image
```
docker buildx build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy -t ai-agents/dataprep:latest -f comps/dataprep/Dockerfile .  
``` 
 
Run Dataprep container
```
docker run -p 5006:5006 -e http_proxy=$http_proxy -e https_proxy=$https_proxy -e HUGGINGFACEHUB_API_TOKEN=<token> -e REDIS_URL=redis://<redis-host-name>:6379 -v /root/.cache/huggingface/hub:/.cache/huggingface/hub ai-agents/dataprep:latest
``` 

 Docker Compose setup

```
export EMBEDDING_MODEL_ID="BAAI/bge-base-en-v1.5"
export TEI_ENDPOINT="http://${your_ip}:6006"
export REDIS_URL="redis://${your_ip}:6379"
export INDEX_NAME=${your_index_name}
export HUGGINGFACEHUB_API_TOKEN=${your_hf_api_token}
docker compose -f comps/dataprep/redis_langchain.yaml up -d
```
