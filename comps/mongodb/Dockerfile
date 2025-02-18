FROM python:3.11-slim AS base

# get security updates
RUN apt-get update && apt-get upgrade -y && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

ENV HOME=/home/user

RUN useradd -m -s /bin/bash user && \
  mkdir -p $HOME && \
  chown -R user $HOME

# Copy the application code into the container
COPY comps /home/user/comps


RUN pip install --no-cache-dir --upgrade pip setuptools && \
    if [ ${ARCH} = "cpu" ]; then pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu; fi && \
    pip install --no-cache-dir -r /home/user/comps/mongodb/requirements.txt

    
ENV PYTHONPATH=/home/user


WORKDIR /home/user/comps/mongodb

ENTRYPOINT ["python", "circular_microservice.py"]