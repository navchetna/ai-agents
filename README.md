# AI Agents Framework

## Setup

1. [Build dataprep component](./comps/dataprep/README.md)
2. [Build reteriver component](./comps/retriever/README.md)
3. Run Dataprep and retriever component together

```
export REDIS_URL="redis://redis-vector-db:6379"
export HUGGINGFACEHUB_API_TOKEN=${your_hf_api_token}
docker compose -f ai-agents/install/docker/docker-compose.yaml up
```


