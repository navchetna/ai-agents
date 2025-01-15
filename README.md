# Setup

```
git clone 
cd ai-agents
docker buildx build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy -t ai-agents/dataprep:latest -f comps/dataprep/Dockerfile .;
docker run -p 5007:5007 -e http_proxy=$http_proxy -e https_proxy=$https_proxy -e HUGGINGFACEHUB_API_TOKEN=<TOKEN> -e REDIS_URL=redis://<REDIS_URL> -v /root/.cache/huggingface/hub:/.cache/huggingface/hub ai-agents/dataprep:latest
```
