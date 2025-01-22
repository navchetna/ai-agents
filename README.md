# AI Agents Framework

## Setup

### Run all services

1. [Build dataprep component](./comps/dataprep/README.md)
2. [Build reteriver component](./comps/retriever/README.md)
3. [Build backend component](./comps/README.md)
4. [Build ui component](./design-patterns/rag/README.md)

```
export EMBEDDING_MODEL_ID="BAAI/bge-base-en-v1.5"
export RERANK_MODEL_ID="BAAI/bge-reranker-base"
export LLM_MODEL_ID="meta-llama/Meta-Llama-3-8B-Instruct"
export INDEX_NAME="rag-redis"
export SERVER_HOST_URL=127.0.0.1:5008
export REDIS_URL="redis://redis-vector-db:6379"
export HUGGINGFACEHUB_API_TOKEN=${your_hf_api_token}
export MEGA_SERVICE_PORT=5008
export EMBEDDING_SERVER_HOST_IP=tei-embedding-service
export EMBEDDING_SERVER_PORT=80
export RETRIEVER_SERVICE_HOST_IP=retriever
export RETRIEVER_SERVICE_PORT=7000 
export RERANK_SERVER_HOST_IP=tei-reranking-service
export RERANK_SERVER_PORT=80 
```

## VLLM Serving:
```
export LLM_SERVER_HOST_IP=vllm-service
export LLM_SERVER_PORT=80
docker compose -f install/docker/docker-compose.yaml up
```


## Groq Serving: 
```

export LLM_SERVER_HOST_IP=groq-service
export LLM_SERVER_PORT=8000
export GROQ_MODEL=llama-3.3-70b-versatile
export GROQ_API_KEY=${GROQ_API_KEY}

docker compose -f install/docker/docker-compose.yaml-groq up
```

> Note: host would be localhost for local dev or server hostname for remote server


