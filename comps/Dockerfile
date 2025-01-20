# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

# Stage 1: base setup used by other stages
FROM python:3.11-slim AS base

# get security updates
RUN apt-get update && apt-get upgrade -y && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

ENV HOME=/home/user

RUN useradd -m -s /bin/bash user && \
  mkdir -p $HOME && \
  chown -R user $HOME

WORKDIR $HOME


# Stage 2: common layer shared by services using GenAIComps
FROM base AS comps-base

# copy just relevant parts
COPY comps $HOME/comps

WORKDIR $HOME

ENV PYTHONPATH=$PYTHONPATH:$HOME/comps

USER user

RUN pip install --no-cache-dir --upgrade pip setuptools && \
  pip install --no-cache-dir -r $HOME/comps/requirements.txt

ENTRYPOINT ["python", "comps/app.py"]