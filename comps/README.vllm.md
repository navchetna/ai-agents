# Build the vLLM image for CPU

First, install recommended compiler. It is recommended to use gcc/g++ >= 12.3.0 as the default compiler to avoid potential problems. For example, on Ubuntu 22.4, you can run:
```bash
sudo apt-get update  -y
sudo apt-get install -y gcc-12 g++-12 libnuma-dev
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-12 10 --slave /usr/bin/g++ g++ /usr/bin/g++-12
```

Second, clone vLLM project:
```bash
git clone https://github.com/vllm-project/vllm.git vllm_source
```
Third, build the vLLM image for CPU:
```bash
docker build -f vllm_source/docker/Dockerfile.cpu -t vllm-cpu-env --shm-size=4g .
```
