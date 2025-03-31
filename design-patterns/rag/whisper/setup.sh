#!/bin/bash

set -e

echo "==== Whisper Speech-to-Text Service Setup ===="
echo ""

# Check OS type
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
elif [ -f /etc/debian_version ]; then
    OS="Debian"
elif [ -f /etc/redhat-release ]; then
    OS="RedHat"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
else
    OS="Unknown"
fi

echo "Detected OS: $OS"
echo ""

# Install ffmpeg
echo "Installing ffmpeg..."
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    sudo apt update
    sudo apt install -y ffmpeg
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"RedHat"* ]]; then
    sudo yum install -y ffmpeg
elif [[ "$OS" == "macOS" ]]; then
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install ffmpeg
else
    echo "Unsupported OS for automatic ffmpeg installation."
    echo "Please install ffmpeg manually and then continue with this script."
    read -p "Press Enter to continue after installing ffmpeg manually..."
fi

# Check if ffmpeg is installed
if command -v ffmpeg &> /dev/null; then
    echo "ffmpeg installed successfully."
    ffmpeg -version | head -n 1
else
    echo "WARNING: ffmpeg installation may have failed. The service will not work without ffmpeg."
    echo "Please install ffmpeg manually before proceeding."
fi

echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Setup completed successfully!"
echo ""
echo "To start the Whisper service, run:"
echo "python service.py"
echo ""
echo "If you want to set environment variables:"
echo "export WHISPER_MODEL_SIZE=base  # Options: tiny, base, small, medium, large"
echo "export WHISPER_SERVICE_PORT=8765"
echo "" 