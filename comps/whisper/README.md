# Whisper service 


## Setup


### Build image
```
cd ai-agents;
docker buildx build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy -t ai-agents/whisper-service:latest -f comps/whisper/Dockerfile .; 
```

### Run container

```
docker run -p 8765:8765 -e no_proxy=$no_proxy -e http_proxy=$http_proxy -e https_proxy=$https_proxy -e WHISPER_SERVICE_PORT=8765 ai-agents/whisper-service:latest
```
