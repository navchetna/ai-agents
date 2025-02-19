import re
import os
import json
import pymongo
from datetime import datetime
from typing import List, Dict, Optional
from uuid import uuid4
from langchain_core.prompts import PromptTemplate
from comps import MegaServiceEndpoint, MicroService, ServiceOrchestrator, ServiceRoleType, ServiceType
from comps.core.utils import handle_message
from comps.proto.api_protocol import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionResponseChoice,
    ChatMessage,
    UsageInfo,
)
from comps.proto.docarray import LLMParams, RerankerParms, RetrieverParms
from fastapi.responses import StreamingResponse
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv


load_dotenv()

MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
MONGO_PORT = os.getenv("MONGO_PORT", "27017")
MEGA_SERVICE_PORT = int(os.getenv("MEGA_SERVICE_PORT", 8888))
GUARDRAIL_SERVICE_HOST_IP = os.getenv("GUARDRAIL_SERVICE_HOST_IP", "0.0.0.0")
GUARDRAIL_SERVICE_PORT = int(os.getenv("GUARDRAIL_SERVICE_PORT", 80))
EMBEDDING_SERVER_HOST_IP = os.getenv("EMBEDDING_SERVER_HOST_IP", "0.0.0.0")
EMBEDDING_SERVER_PORT = int(os.getenv("EMBEDDING_SERVER_PORT", 80))
RETRIEVER_SERVICE_HOST_IP = os.getenv("RETRIEVER_SERVICE_HOST_IP", "0.0.0.0")
RETRIEVER_SERVICE_PORT = int(os.getenv("RETRIEVER_SERVICE_PORT", 7000))
RERANK_SERVER_HOST_IP = os.getenv("RERANK_SERVER_HOST_IP", "0.0.0.0")
RERANK_SERVER_PORT = int(os.getenv("RERANK_SERVER_PORT", 80))
LLM_SERVER_HOST_IP = os.getenv("LLM_SERVER_HOST_IP", "0.0.0.0")
LLM_SERVER_PORT = int(os.getenv("LLM_SERVER_PORT", 80))
LLM_MODEL = os.getenv("LLM_MODEL", "Intel/neural-chat-7b-v3-3")

if MONGO_USERNAME and MONGO_PASSWORD:
    MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}"
else:
    MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}"


def align_inputs(self, inputs, cur_node, runtime_graph, llm_parameters_dict, **kwargs):
    if self.services[cur_node].service_type == ServiceType.EMBEDDING:
        inputs["inputs"] = inputs["text"]
        del inputs["text"]
    elif self.services[cur_node].service_type == ServiceType.RETRIEVER:
        # prepare the retriever params
        retriever_parameters = kwargs.get("retriever_parameters", None)
        if retriever_parameters:
            inputs.update(retriever_parameters.dict())
    elif self.services[cur_node].service_type == ServiceType.LLM:
        # convert TGI/vLLM to unified OpenAI /v1/chat/completions format
        next_inputs = {}
        next_inputs["model"] = LLM_MODEL
        next_inputs["messages"] = [{"role": "user", "content": inputs["inputs"]}]
        next_inputs["max_tokens"] = llm_parameters_dict["max_tokens"]
        next_inputs["top_p"] = llm_parameters_dict["top_p"]
        next_inputs["stream"] = inputs["stream"]
        next_inputs["frequency_penalty"] = inputs["frequency_penalty"]
        # next_inputs["presence_penalty"] = inputs["presence_penalty"]
        # next_inputs["repetition_penalty"] = inputs["repetition_penalty"]
        next_inputs["temperature"] = inputs["temperature"]
        inputs = next_inputs
    return inputs

def align_outputs(self, data, cur_node, inputs, runtime_graph, llm_parameters_dict, **kwargs):
    next_data = {}
    if self.services[cur_node].service_type == ServiceType.EMBEDDING:
        assert isinstance(data, list)
        next_data = {"text": inputs["inputs"], "embedding": data[0]}
    elif self.services[cur_node].service_type == ServiceType.RETRIEVER:
        if "retrieved_docs" in data:
            enhanced_docs = []
            for doc in data["retrieved_docs"]:
                enhanced_doc = doc.copy()
                if "source" not in enhanced_doc and "id" in enhanced_doc:
                    enhanced_doc["source"] = enhanced_doc["id"]
                if "content" not in enhanced_doc and "text" in enhanced_doc:
                    enhanced_doc["content"] = enhanced_doc["text"]
                enhanced_docs.append(enhanced_doc)
                
            next_data["source_docs"] = enhanced_docs
            
        docs = [doc["text"] for doc in data["retrieved_docs"]]

        with_rerank = runtime_graph.downstream(cur_node)[0].startswith("rerank")
        if with_rerank and docs:
            # forward to rerank
            # prepare inputs for rerank
            next_data["query"] = data["initial_query"]
            next_data["texts"] = [doc["text"] for doc in data["retrieved_docs"]]
            next_data["doc_metadata"] = data["retrieved_docs"]
        else:
            # forward to llm
            if not docs and with_rerank:
                # delete the rerank from retriever -> rerank -> llm
                for ds in reversed(runtime_graph.downstream(cur_node)):
                    for nds in runtime_graph.downstream(ds):
                        runtime_graph.add_edge(cur_node, nds)
                    runtime_graph.delete_node_if_exists(ds)

            # handle template
            # if user provides template, then format the prompt with it
            # otherwise, use the default template
            prompt = data["initial_query"]
            chat_template = llm_parameters_dict["chat_template"]
            if chat_template:
                prompt_template = PromptTemplate.from_template(chat_template)
                input_variables = prompt_template.input_variables
                if sorted(input_variables) == ["context", "question"]:
                    prompt = prompt_template.format(question=data["initial_query"], context="\n".join(docs))
                elif input_variables == ["question"]:
                    prompt = prompt_template.format(question=data["initial_query"])
                else:
                    print(f"{prompt_template} not used, we only support 2 input variables ['question', 'context']")
                    prompt = ChatTemplate.generate_rag_prompt(data["initial_query"], docs)
            else:
                prompt = ChatTemplate.generate_rag_prompt(data["initial_query"], docs)

            next_data["inputs"] = prompt
            enhanced_sources = []
            for doc in data["retrieved_docs"]:
                source = doc.copy()
                if "relevance_score" not in source:
                    source["relevance_score"] = 1.0
                enhanced_sources.append(source)
            next_data["selected_sources"] = enhanced_sources

    elif self.services[cur_node].service_type == ServiceType.RERANK:
        # rerank the inputs with the scores
        reranker_parameters = kwargs.get("reranker_parameters", None)
        top_n = reranker_parameters.top_n if reranker_parameters else 1
        docs = inputs["texts"]
        reranked_docs = []
        selected_sources = []
        
        doc_metadata = inputs.get("doc_metadata", [])
        
        for best_response in data[:top_n]:
            idx = best_response["index"]
            reranked_docs.append(docs[idx])
            
            if idx < len(doc_metadata):
                source_info = doc_metadata[idx].copy()
                source_info["relevance_score"] = float(best_response["score"])
                
                if "source" not in source_info and "id" in source_info:
                    source_info["source"] = source_info["id"]
                if "content" not in source_info and "text" in source_info:
                    source_info["content"] = source_info["text"]
                
                selected_sources.append(source_info)
                print(f"DEBUG: Added reranked source: {source_info.get('source', 'unknown')} with score {source_info.get('relevance_score', 0.0)}")

        # handle template
        # if user provides template, then format the prompt with it
        # otherwise, use the default template
        prompt = inputs["query"]
        chat_template = llm_parameters_dict["chat_template"]
        if chat_template:
            prompt_template = PromptTemplate.from_template(chat_template)
            input_variables = prompt_template.input_variables
            if sorted(input_variables) == ["context", "question"]:
                prompt = prompt_template.format(question=prompt, context="\n".join(reranked_docs))
            elif input_variables == ["question"]:
                prompt = prompt_template.format(question=prompt)
            else:
                print(f"{prompt_template} not used, we only support 2 input variables ['question', 'context']")
                prompt = ChatTemplate.generate_rag_prompt(prompt, reranked_docs)
        else:
            prompt = ChatTemplate.generate_rag_prompt(prompt, reranked_docs)

        next_data["inputs"] = prompt
        next_data["selected_sources"] = selected_sources

    elif self.services[cur_node].service_type == ServiceType.LLM and not llm_parameters_dict["stream"]:
        next_data["text"] = data["choices"][0]["message"]["content"]
        if "selected_sources" in inputs:
            next_data["selected_sources"] = inputs["selected_sources"]
    else:
        next_data = data
        if "selected_sources" in inputs:
            next_data["selected_sources"] = inputs["selected_sources"]

    return next_data

def align_generator(self, gen, **kwargs):
    # store words in a buffer and concat them
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

    for line in gen:
        line = line.decode("utf-8")
        start = line.find("{")
        end = line.rfind("}") + 1

        json_str = line[start:end]
        try:
            json_data = json.loads(json_str)
            if (
                json_data["choices"][0]["finish_reason"] != "eos_token"
                and "content" in json_data["choices"][0]["delta"]
            ):
                new_content = json_data["choices"][0]["delta"]["content"]
                
                for i, char in enumerate(new_content):
                    next_char = new_content[i + 1] if i + 1 < len(new_content) else None
                    is_boundary, include_char = is_word_boundary(char, next_char)
                    
                    if include_char:
                        buffer += char
                        in_word = True
                    
                    if is_boundary and in_word:
                        if buffer.strip():
                            yield f"data: {repr((buffer + char).encode('utf-8'))}\n\n"
                            buffer = ""
                            in_word = False
                    elif is_boundary:
                        yield f"data: {repr(char.encode('utf-8'))}\n\n"
                        
        except Exception as e:
            if buffer:
                yield f"data: {repr(buffer.encode('utf-8'))}\n\n"
                buffer = ""
            yield f"data: {repr(json_str.encode('utf-8'))}\n\n"
    
    if buffer.strip():
        yield f"data: {repr(buffer.encode('utf-8'))}\n\n"
    yield "data: [DONE]\n\n"


class SourceInfo(BaseModel):
    source: str
    content: str
    relevance_score: float

class ConversationRequest(BaseModel):
    question: str
    db_name: str
    conversation_id: Optional[str] = None
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.1
    top_k: Optional[int] = 3

class ConversationResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: List[SourceInfo]

class ChatTemplate:
    @staticmethod
    def generate_rag_prompt(question, documents):
        context_str = "\n".join(documents)
        if context_str and len(re.findall("[\u4E00-\u9FFF]", context_str)) / len(context_str) >= 0.3:
            # chinese context
            template = """
### 你将扮演一个乐于助人、尊重他人并诚实的助手，你的目标是帮助用户解答问题。有效地利用来自本地知识库的搜索结果。确保你的回答中只包含相关信息。如果你不确定问题的答案，请避免分享不准确的信息。
### 搜索结果：{context}
### 问题：{question}
### 回答：
"""
        else:
            template = """
### You are a helpful, respectful and honest assistant to help the user with questions. \
Please refer to the search results obtained from the local knowledge base. \
But be careful to not incorporate the information that you think is not relevant to the question. \
If you don't know the answer to a question, please don't share false information. \n
### Search results: {context} \n
### Question: {question} \n
### Answer:
"""
        return template.format(context=context_str, question=question)


class ChatQnAService:
    def __init__(self, host="0.0.0.0", port=8000):
        self.host = host
        self.port = port
        ServiceOrchestrator.align_inputs = align_inputs
        ServiceOrchestrator.align_outputs = align_outputs
        ServiceOrchestrator.align_generator = align_generator
        self.megaservice = ServiceOrchestrator()
        self.endpoint = str(MegaServiceEndpoint.CHAT_QNA)

    def add_remote_service(self):

        embedding = MicroService(
            name="embedding",
            host=EMBEDDING_SERVER_HOST_IP,
            port=EMBEDDING_SERVER_PORT,
            endpoint="/embed",
            use_remote_service=True,
            service_type=ServiceType.EMBEDDING,
        )

        retriever = MicroService(
            name="retriever",
            host=RETRIEVER_SERVICE_HOST_IP,
            port=RETRIEVER_SERVICE_PORT,
            endpoint="/v1/retrieval",
            use_remote_service=True,
            service_type=ServiceType.RETRIEVER,
        )

        rerank = MicroService(
            name="rerank",
            host=RERANK_SERVER_HOST_IP,
            port=RERANK_SERVER_PORT,
            endpoint="/rerank",
            use_remote_service=True,
            service_type=ServiceType.RERANK,
        )

        llm = MicroService(
            name="llm",
            host=LLM_SERVER_HOST_IP,
            port=LLM_SERVER_PORT,
            endpoint="/v1/chat/completions",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        self.megaservice.add(embedding).add(retriever).add(rerank).add(llm)
        self.megaservice.flow_to(embedding, retriever)
        self.megaservice.flow_to(retriever, rerank)
        self.megaservice.flow_to(rerank, llm)

    def add_remote_service_without_rerank(self):

        embedding = MicroService(
            name="embedding",
            host=EMBEDDING_SERVER_HOST_IP,
            port=EMBEDDING_SERVER_PORT,
            endpoint="/embed",
            use_remote_service=True,
            service_type=ServiceType.EMBEDDING,
        )

        retriever = MicroService(
            name="retriever",
            host=RETRIEVER_SERVICE_HOST_IP,
            port=RETRIEVER_SERVICE_PORT,
            endpoint="/v1/retrieval",
            use_remote_service=True,
            service_type=ServiceType.RETRIEVER,
        )

        llm = MicroService(
            name="llm",
            host=LLM_SERVER_HOST_IP,
            port=LLM_SERVER_PORT,
            endpoint="/v1/chat/completions",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        self.megaservice.add(embedding).add(retriever).add(llm)
        self.megaservice.flow_to(embedding, retriever)
        self.megaservice.flow_to(retriever, llm)

    def add_remote_service_with_guardrails(self):
        guardrail_in = MicroService(
            name="guardrail_in",
            host=GUARDRAIL_SERVICE_HOST_IP,
            port=GUARDRAIL_SERVICE_PORT,
            endpoint="/v1/guardrails",
            use_remote_service=True,
            service_type=ServiceType.GUARDRAIL,
        )
        embedding = MicroService(
            name="embedding",
            host=EMBEDDING_SERVER_HOST_IP,
            port=EMBEDDING_SERVER_PORT,
            endpoint="/embed",
            use_remote_service=True,
            service_type=ServiceType.EMBEDDING,
        )
        retriever = MicroService(
            name="retriever",
            host=RETRIEVER_SERVICE_HOST_IP,
            port=RETRIEVER_SERVICE_PORT,
            endpoint="/v1/retrieval",
            use_remote_service=True,
            service_type=ServiceType.RETRIEVER,
        )
        rerank = MicroService(
            name="rerank",
            host=RERANK_SERVER_HOST_IP,
            port=RERANK_SERVER_PORT,
            endpoint="/rerank",
            use_remote_service=True,
            service_type=ServiceType.RERANK,
        )
        llm = MicroService(
            name="llm",
            host=LLM_SERVER_HOST_IP,
            port=LLM_SERVER_PORT,
            endpoint="/v1/chat/completions",
            use_remote_service=True,
            service_type=ServiceType.LLM,
        )
        # guardrail_out = MicroService(
        #     name="guardrail_out",
        #     host=GUARDRAIL_SERVICE_HOST_IP,
        #     port=GUARDRAIL_SERVICE_PORT,
        #     endpoint="/v1/guardrails",
        #     use_remote_service=True,
        #     service_type=ServiceType.GUARDRAIL,
        # )
        # self.megaservice.add(guardrail_in).add(embedding).add(retriever).add(rerank).add(llm).add(guardrail_out)
        self.megaservice.add(guardrail_in).add(embedding).add(retriever).add(rerank).add(llm)
        self.megaservice.flow_to(guardrail_in, embedding)
        self.megaservice.flow_to(embedding, retriever)
        self.megaservice.flow_to(retriever, rerank)
        self.megaservice.flow_to(rerank, llm)
        # self.megaservice.flow_to(llm, guardrail_out)

    async def handle_request(self, request: Request):
        data = await request.json()
        stream_opt = data.get("stream", True)
        chat_request = ChatCompletionRequest.parse_obj(data)
        prompt = handle_message(chat_request.messages)
        
        parameters = LLMParams(
            max_tokens=chat_request.max_tokens if chat_request.max_tokens else 1024,
            top_k=chat_request.top_k if chat_request.top_k else 10,
            top_p=chat_request.top_p if chat_request.top_p else 0.95,
            temperature=chat_request.temperature if chat_request.temperature else 0.01,
            frequency_penalty=chat_request.frequency_penalty if chat_request.frequency_penalty else 0.0,
            presence_penalty=chat_request.presence_penalty if chat_request.presence_penalty else 0.0,
            repetition_penalty=chat_request.repetition_penalty if chat_request.repetition_penalty else 1.03,
            stream=stream_opt,
            chat_template=chat_request.chat_template if chat_request.chat_template else None,
        )
        retriever_parameters = RetrieverParms(
            search_type=chat_request.search_type if chat_request.search_type else "similarity",
            k=chat_request.k if chat_request.k else 4,
            distance_threshold=chat_request.distance_threshold if chat_request.distance_threshold else None,
            fetch_k=chat_request.fetch_k if chat_request.fetch_k else 20,
            lambda_mult=chat_request.lambda_mult if chat_request.lambda_mult else 0.5,
            score_threshold=chat_request.score_threshold if chat_request.score_threshold else 0.2,
        )
        reranker_parameters = RerankerParms(
            top_n=chat_request.top_n if chat_request.top_n else 3,
        )
        
        try:
            result_dict, runtime_graph = await self.megaservice.schedule(
                initial_inputs={"text": prompt},
                llm_parameters=parameters,
                retriever_parameters=retriever_parameters,
                reranker_parameters=reranker_parameters,
            )
            
            for node, response in result_dict.items():
                if isinstance(response, StreamingResponse):
                    return response
                    
            last_node = runtime_graph.all_leaves()[-1]
            response = result_dict[last_node]["text"]
            
            sources = []
            if "selected_sources" in result_dict[last_node]:
                sources = result_dict[last_node]["selected_sources"]
                print(f"DEBUG: Found {len(sources)} sources in result")
            else:
                print("DEBUG: No sources found in result")
                
            if not sources:
                for node_name, node_data in result_dict.items():
                    if isinstance(node_data, dict) and "selected_sources" in node_data:
                        sources = node_data["selected_sources"]
                        print(f"DEBUG: Found {len(sources)} sources in node {node_name}")
                        break
                
            choices = []
            usage = UsageInfo()
            choices.append(
                ChatCompletionResponseChoice(
                    index=0,
                    message=ChatMessage(role="assistant", content=response),
                    finish_reason="stop",
                )
            )
            
            completion_response = ChatCompletionResponse(
                model="chatqna", 
                choices=choices, 
                usage=usage
            )
            
            response_dict = completion_response.dict()
            response_dict["sources"] = sources
            
            print(f"DEBUG: Returning response with {len(sources)} sources")
            for i, src in enumerate(sources):
                print(f"DEBUG: Source {i+1}: {src.get('source', 'unknown')} score: {src.get('relevance_score', 0.0)}")
            
            return JSONResponse(content=response_dict)
            
        except Exception as e:
            print(f"ERROR in handle_request: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

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


class ConversationRAGService(ChatQnAService):
    def __init__(self, host="0.0.0.0", port=8000):
        super().__init__(host=host, port=port)
        self.active_conversations = {}
        
        try:
            self.mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            self.mongo_client.server_info()
            print("Successfully connected to MongoDB")
        except Exception as e:
            print(f"Error connecting to MongoDB: {str(e)}")
            raise Exception("Failed to connect to MongoDB")

    def get_conversation_history(self, conversation_id: str) -> str:
        if conversation_id not in self.active_conversations:
            stored_conversation = self.conversations_collection.find_one(
                {"conversation_id": conversation_id}
            )
            if stored_conversation:
                self.active_conversations[conversation_id] = stored_conversation["history"]
            else:
                return ""

        history = []
        for turn in self.active_conversations[conversation_id]:
            history.append(f"User: {turn['question']}")
            history.append(f"Assistant: {turn['answer']}")
        return "\n\n".join(history)
    
    async def handle_new_conversation(self, request: Request):
        try:
            data = await request.json()
            db = self.mongo_client[data["db_name"]]
            conversations_collection = db["conversations"]
            conversation_id = str(uuid4())
            self.active_conversations[conversation_id] = []
            
            conversations_collection.insert_one({
                "conversation_id": conversation_id,
                "created_at": datetime.now(),
                "last_updated": datetime.now(),
                "history": []
            })
            
            return JSONResponse(content={"conversation_id": conversation_id})
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def save_conversation_turn(self, conversation_id: str, question: str, conversations_collection: str, answer: str, sources: List[Dict]):
        turn = {
            "question": question,
            "answer": answer,
            "sources": sources,
            "timestamp": datetime.now()
        }

        if conversation_id not in self.active_conversations:
            self.active_conversations[conversation_id] = []
        
        self.active_conversations[conversation_id].append(turn)

        serialized_turn = self.serialize_datetime(turn)
        
        # Save to MongoDB
        conversations_collection.update_one(
            {"conversation_id": conversation_id},
            {
                "$set": {
                    "last_updated": datetime.now().isoformat(),
                    "history": self.serialize_datetime(self.active_conversations[conversation_id])
                }
            },
            upsert=True
        )

    def prepare_source_info_list(self, sources_data: List[Dict]) -> List[SourceInfo]:
        """Convert raw source data to SourceInfo objects"""
        source_info_list = []
        for source in sources_data:
            source_info = SourceInfo(
                source=source.get("source", source.get("id", "unknown")),
                content=source.get("content", source.get("text", "")),
                relevance_score=float(source.get("relevance_score", source.get("score", 0.0)))
            )
            source_info_list.append(source_info)
        return source_info_list

    async def handle_chat_request(self, request: Request):
        try:
            data = await request.json()
            conversation_request = ConversationRequest.parse_obj(data)
            db = self.mongo_client[conversation_request.db_name]
            conversations_collection = db["conversations"]
            
            if not conversation_request.conversation_id and "conversation_id" in request.path_params:
                conversation_request.conversation_id = request.path_params["conversation_id"]
            
            if conversation_request.conversation_id not in self.active_conversations:
                stored_conversation = conversations_collection.find_one(
                    {"conversation_id": conversation_request.conversation_id}
                )
                if stored_conversation:
                    self.active_conversations[conversation_request.conversation_id] = stored_conversation["history"]
                else:
                    self.active_conversations[conversation_request.conversation_id] = []

            chat_data = {
                "messages": [{"role": "user", "content": conversation_request.question}],
                "max_tokens": conversation_request.max_tokens,
                "temperature": conversation_request.temperature,
                "stream": False,
                "k": conversation_request.top_k or 3,
                "top_n": conversation_request.top_k or 3
            }
            
            new_request = Request(scope=request.scope)
            async def receive():
                return {"type": "http.request", "body": json.dumps(chat_data).encode()}
            new_request._receive = receive

            rag_response = await super().handle_request(new_request)
            
            if isinstance(rag_response, JSONResponse):
                response_data = json.loads(rag_response.body.decode())
                answer = response_data["choices"][0]["message"]["content"]
                
                sources = response_data.get("sources", [])
                
                processed_sources = []
                for source in sources:
                    if isinstance(source, dict):
                        if not source.get("source") and source.get("id"):
                            source["source"] = source.get("id")
                        if not source.get("content") and source.get("text"):
                            source["content"] = source.get("text")
                        if not source.get("relevance_score") and source.get("score"):
                            source["relevance_score"] = float(source.get("score"))
                            
                        processed_source = {
                            "source": source.get("source", "unknown"),
                            "content": source.get("content", source.get("text", "")),
                            "relevance_score": float(source.get("relevance_score", 0.0))
                        }
                        processed_sources.append(processed_source)
                
                source_info_list = self.prepare_source_info_list(processed_sources)
                
                self.save_conversation_turn(
                    conversation_request.conversation_id,
                    conversation_request.question,
                    conversations_collection,
                    answer,
                    processed_sources
                )

                return ConversationResponse(
                    conversation_id=conversation_request.conversation_id,
                    answer=answer,
                    sources=source_info_list
                )
            elif isinstance(rag_response, ChatCompletionResponse):
                answer = rag_response.choices[0].message.content
                sources = getattr(rag_response, "sources", [])
                
                processed_sources = []
                if sources:
                    for source in sources:
                        processed_source = {
                            "source": source.get("source", "unknown"),
                            "content": source.get("content", source.get("text", "")),
                            "relevance_score": float(source.get("relevance_score", 0.0))
                        }
                        processed_sources.append(processed_source)
                
                self.save_conversation_turn(
                    conversation_request.conversation_id,
                    conversation_request.question,
                    conversations_collection,
                    answer,
                    processed_sources
                )

                source_info_list = self.prepare_source_info_list(processed_sources)
                
                return ConversationResponse(
                    conversation_id=conversation_request.conversation_id,
                    answer=answer,
                    sources=source_info_list
                )
            
            return rag_response

        except Exception as e:
            print(f"Error processing request: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Request processing failed: {str(e)}"
            )

    def serialize_datetime(self, obj):
        if isinstance(obj, dict):
            return {k: self.serialize_datetime(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.serialize_datetime(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return obj
        
    async def handle_get_history(self, request: Request):
        try:
            conversation_id = request.path_params["conversation_id"]
            db = self.mongo_client[request.path_params["db_name"]]
            conversations_collection = db["conversations"]
            if conversation_id in self.active_conversations:
                stored_conversation = conversations_collection.find_one(
                    {"conversation_id": conversation_id}
                )
                if stored_conversation:
                    stored_conversation.pop('_id', None)
                    serialized_data = self.serialize_datetime(stored_conversation)
                    return JSONResponse(content=serialized_data)
            
            stored_conversation = conversations_collection.find_one(
                {"conversation_id": conversation_id}
            )
            
            if stored_conversation:
                stored_conversation.pop('_id', None)
                serialized_data = self.serialize_datetime(stored_conversation)
                return JSONResponse(content=serialized_data)
                
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def handle_delete_conversation(self, request: Request):
        try:
            conversation_id = request.path_params["conversation_id"]
            data = await request.json()
            db = self.mongo_client[data["db_name"]]
            conversations_collection = db["conversations"]
            self.active_conversations.pop(conversation_id, None)
            
            result = conversations_collection.delete_one(
                {"conversation_id": conversation_id}
            )
            
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Conversation not found")
                
            return JSONResponse(content={"message": "Conversation deleted successfully"})
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def handle_list_conversations(self, request: Request):
        try:
            db = self.mongo_client[request.path_params["db_name"]]
            conversations_collection = db["conversations"]
            query_params = dict(request.query_params)
            limit = int(query_params.get("limit", 10))
            skip = int(query_params.get("skip", 0))
            
            conversations = list(conversations_collection
                                .find({}, {'_id': 0})
                                .sort('last_updated', -1)
                                .skip(skip)
                                .limit(limit))
            
            total = conversations_collection.count_documents({})
            
            serialized_conversations = self.serialize_datetime(conversations)
            
            return JSONResponse(content={
                "total": total,
                "skip": skip,
                "limit": limit,
                "conversations": serialized_conversations
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def start(self):
        self.service = MicroService(
            self.__class__.__name__,
            service_role=ServiceRoleType.MEGASERVICE,
            host=self.host,
            port=self.port,
            endpoint="/",
            input_datatype=ConversationRequest,
            output_datatype=ConversationResponse,
        )

        self.service.add_route("/conversation/new", self.handle_new_conversation, methods=["POST"])
        self.service.add_route("/conversation/{conversation_id}", self.handle_chat_request, methods=["POST"])
        self.service.add_route("/conversation/{conversation_id}", self.handle_get_history, methods=["GET"])
        self.service.add_route("/conversation/{conversation_id}", self.handle_delete_conversation, methods=["DELETE"])
        self.service.add_route("/conversations", self.handle_list_conversations, methods=["GET"])

        self.service.start()

if __name__ == "__main__":
    conversation_service = ConversationRAGService(port=int(os.getenv("MEGA_SERVICE_PORT", 9001)))
    conversation_service.add_remote_service()
    conversation_service.start()