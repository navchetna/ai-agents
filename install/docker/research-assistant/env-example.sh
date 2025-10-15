export no_proxy="127.0.0.1,localhost,dataprep-redis,tei-embedding-service,retriever,tei-reranking-service,backend,mongodb,vllm-service,whisper-service,groq-service"

export LOGFLAG=True

export EMBEDDING_MODEL_ID="BAAI/bge-small-en-v1.5"
export RERANK_MODEL_ID="BAAI/bge-reranker-base"
export LLM_MODEL_ID="meta-llama/Llama-3.2-1B-Instruct"
export REDIS_URL="redis://redis-vector-db:6379"
export INDEX_NAME="rag-redis"

export EMBEDDING_SERVER_HOST_IP=tei-embedding-service
export EMBEDDING_SERVER_PORT=80
export RETRIEVER_SERVICE_HOST_IP=retriever
export RETRIEVER_SERVICE_PORT=7000
export RERANK_SERVER_HOST_IP=tei-reranking-service
export RERANK_SERVER_PORT=80
export WHISPER_SERVICE_HOST_IP=whisper-service
export WHISPER_SERVICE_PORT=8765
export LLM_SERVER_HOST_IP=groq-service
export LLM_SERVER_PORT=8000
export MEGA_SERVICE_PORT=5008
export SERVER_HOST_URL="localhost:$MEGA_SERVICE_PORT"
export NEXT_PUBLIC_SERVER_URL=$SERVER_HOST_URL

export MONGO_HOST=mongodb
export MONGO_USERNAME=agents
export MONGO_PASSWORD=agents

# User specific environment variables

export HUGGINGFACEHUB_API_TOKEN=
export GROQ_API_KEY=

export DATAPREP_OUT_DIR=/home/ecasteli/ai-agents/comps/dataprep # path to store processed data
export HF_CACHE=/home/ecasteli/.cache/huggingface/hub # path to huggingface cache dir
export DATAPREP_CACHE=/home/ecasteli/.cache/ # path to cache dir