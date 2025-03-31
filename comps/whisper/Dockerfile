FROM python:3.9-slim

# Install ffmpeg which is required by Whisper
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the service code
COPY service.py .

# Environment variables with defaults
ENV WHISPER_MODEL_SIZE=base
ENV WHISPER_SERVICE_PORT=8765

# Expose the service port
EXPOSE ${WHISPER_SERVICE_PORT}

# Start the service
CMD ["python", "service.py"] 