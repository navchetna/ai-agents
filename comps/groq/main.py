from groq import Groq
from fastapi import Request
from fastapi.responses import StreamingResponse
import json
import os

from comps import  MicroService, ServiceRoleType
from comps.proto.api_protocol import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionResponseChoice,
    ChatMessage,
    UsageInfo,
)

class GroqService:
    def __init__(self, host="0.0.0.0", port=8000):
        self.client = Groq()
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.host = host
        self.port = port
        self.endpoint = "/v1/chat/completions"
        
    def start(self):
        self.service = MicroService(
            self.__class__.__name__,
            service_role=ServiceRoleType.MEGASERVICE,
            host=self.host,
            port=self.port,
            endpoint=self.endpoint,
            input_datatype=ChatCompletionRequest,
            output_datatype=ChatCompletionResponse,
        )

        self.service.add_route(self.endpoint, self.handle_request, methods=["POST"])
        self.service.start()
        
    async def handle_request(self, request: Request):
        data = await request.json()
        stream_opt = data.get("stream", True)
        chat_request = ChatCompletionRequest.parse_obj(data)
        
        if isinstance(chat_request.messages, str):
            messages = [{"role": "user", "content": chat_request.messages}]
        else:
            messages = chat_request.messages
            
        response = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=chat_request.temperature if chat_request.temperature else 0.01,
            max_tokens=chat_request.max_tokens if chat_request.max_tokens else 1024,
            top_p=chat_request.top_p if chat_request.top_p else 0.95,
            stream=stream_opt
        )
        
        if stream_opt:
            return StreamingResponse(
                self._generate_stream(response),
                media_type="text/event-stream"
            )
        else:
            content = response.choices[0].message.content
            choices = [
                ChatCompletionResponseChoice(
                    index=0,
                    message=ChatMessage(role="assistant", content=content),
                    finish_reason="stop",
                )
            ]
            return ChatCompletionResponse(model=self.model, choices=choices, usage=UsageInfo())

    async def _generate_stream(self, response):
        buffer = ""
        in_word = False
        
        def is_word_boundary(curr_char, next_char=None):
            if curr_char == '.':
                if (buffer and buffer[-1].isdigit() and 
                    next_char and next_char.isdigit()):
                    return False, True
                if (buffer and buffer[-1].isupper() and 
                    next_char and next_char.isupper()):
                    return False, True
                    
            if curr_char == '-':
                if (buffer and buffer[-1].isalnum() and 
                    next_char and next_char.isalnum()):
                    return False, True
                    
            if curr_char in ' \t\n.,!?;:()[]{}':
                return True, False
                
            return False, True

        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                new_content = chunk.choices[0].delta.content
                
                for i, char in enumerate(new_content):
                    next_char = new_content[i + 1] if i + 1 < len(new_content) else None
                    is_boundary, include_char = is_word_boundary(char, next_char)
                    
                    if include_char:
                        buffer += char
                        in_word = True
                    
                    if is_boundary and in_word:
                        if buffer.strip():
                            chunk_data = {
                                "choices": [{
                                    "delta": {"content": buffer + char},
                                    "finish_reason": None
                                }]
                            }
                            yield f"data: {json.dumps(chunk_data)}\n\n"
                            buffer = ""
                            in_word = False
                    elif is_boundary:
                        chunk_data = {
                            "choices": [{
                                "delta": {"content": char},
                                "finish_reason": None
                            }]
                        }
                        yield f"data: {json.dumps(chunk_data)}\n\n"
        
        if buffer.strip():
            chunk_data = {
                "choices": [{
                    "delta": {"content": buffer},
                    "finish_reason": None
                }]
            }
            yield f"data: {json.dumps(chunk_data)}\n\n"

        final_data = {
            "choices": [{
                "delta": {},
                "finish_reason": "eos_token"
            }]
        }
        yield f"data: {json.dumps(final_data)}\n\n"
        yield "data: [DONE]\n\n"

if __name__ == "__main__":
    groq_service = GroqService(port=8000)
    groq_service.start()
