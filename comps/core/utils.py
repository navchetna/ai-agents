import os
import base64
import ipaddress
import json
import multiprocessing
import random
from io import BytesIO
from socket import AF_INET, SOCK_STREAM, socket
from typing import List, Optional, Union

import requests
from PIL import Image

from .logger import CustomLogger

def mkdirIfNotExists(dir: str):
  if not os.path.exists(dir):
    os.makedirs(dir)
  
def is_port_free(host: str, port: int) -> bool:
    """Check if a given port on a host is free.

    :param host: The host to check.
    :param port: The port to check.
    :return: True if the port is free, False otherwise.
    """
    with socket(AF_INET, SOCK_STREAM) as session:
        return session.connect_ex((host, port)) != 0


def check_ports_availability(host: Union[str, List[str]], port: Union[int, List[int]]) -> bool:
    """Check if one or more ports on one or more hosts are free.

    :param host: The host(s) to check.
    :param port: The port(s) to check.
    :return: True if all ports on all hosts are free, False otherwise.
    """
    hosts = [host] if isinstance(host, str) else host
    ports = [port] if isinstance(port, int) else port

    return all(is_port_free(h, p) for h in hosts for p in ports)

def handle_message(messages):
    images = []
    if isinstance(messages, str):
        prompt = messages
    else:
        messages_dict = {}
        system_prompt = ""
        prompt = ""
        for message in messages:
            msg_role = message["role"]
            if msg_role == "system":
                system_prompt = message["content"]
            elif msg_role == "user":
                if type(message["content"]) == list:
                    text = ""
                    text_list = [item["text"] for item in message["content"] if item["type"] == "text"]
                    text += "\n".join(text_list)
                    image_list = [
                        item["image_url"]["url"] for item in message["content"] if item["type"] == "image_url"
                    ]
                    if image_list:
                        messages_dict[msg_role] = (text, image_list)
                    else:
                        messages_dict[msg_role] = text
                else:
                    messages_dict[msg_role] = message["content"]
            elif msg_role == "assistant":
                messages_dict[msg_role] = message["content"]
            else:
                raise ValueError(f"Unknown role: {msg_role}")

        if system_prompt:
            prompt = system_prompt + "\n"
        for role, message in messages_dict.items():
            if isinstance(message, tuple):
                text, image_list = message
                if text:
                    prompt += role + ": " + text + "\n"
                else:
                    prompt += role + ":"
                for img in image_list:
                    # URL
                    if img.startswith("http://") or img.startswith("https://"):
                        response = requests.get(img)
                        image = Image.open(BytesIO(response.content)).convert("RGBA")
                        image_bytes = BytesIO()
                        image.save(image_bytes, format="PNG")
                        img_b64_str = base64.b64encode(image_bytes.getvalue()).decode()
                    # Local Path
                    elif os.path.exists(img):
                        image = Image.open(img).convert("RGBA")
                        image_bytes = BytesIO()
                        image.save(image_bytes, format="PNG")
                        img_b64_str = base64.b64encode(image_bytes.getvalue()).decode()
                    # Bytes
                    else:
                        img_b64_str = img

                    images.append(img_b64_str)
            else:
                if message:
                    prompt += role + ": " + message + "\n"
                else:
                    prompt += role + ":"
    if images:
        return prompt, images
    else:
        return prompt

