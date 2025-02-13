from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
from uuid import uuid4
from groq import Groq
from langchain_community.vectorstores import Redis as LangRedis
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
import redis

EMBEDDING_MODEL_ID = "BAAI/bge-base-en-v1.5"
GROQ_MODEL_ID = "llama-3.3-70b-versatile"

@dataclass
class Message:
    content: str
    timestamp: datetime
    role: str 

@dataclass
class Context:
    content: str
    source: str 
    relevance_score: float 

@dataclass
class ConversationTurn:
    question: Message
    answer: Message
    context: List[Context]

class PromptTemplate:
    
    @staticmethod
    def create_prompt(question: str, context: str, conversation_history: str = "") -> str:
        history_section = f"\nPrevious Conversation:\n{conversation_history}\n" if conversation_history else ""
        
        return f"""You are an intelligent research assistant specialized in analyzing and discussing academic papers, research documents, and scientific literature. Your goal is to provide accurate, well-structured answers based on the provided context.

Context:
{context}{history_section}

User Question: {question}

Instructions:
1. Focus on answering the question using ONLY the information provided in the context above.
2. If the context doesn't contain enough information to fully answer the question, explicitly state that limitation.
3. If you need to make assumptions, clearly state them.
4. Use academic/scientific language while maintaining clarity.
5. When referring to specific findings or claims, indicate if they come from the provided context.
6. Structure your response logically with clear paragraphs for different points.
7. If relevant, include:
   - Key findings or conclusions
   - Methodology details
   - Statistical significance
   - Limitations or caveats
   - Real-world implications

Answer: Let me address your question based on the provided research context."""

class RAGConversation:    
    def __init__(self, redis_url: str = "redis://localhost:6379", 
                 index_name: str = "rag-redis",
                 groq_api_key: Optional[str] = None):
        self.conversation_id: str = str(uuid4())
        self.turns: List[ConversationTurn] = []
        self.created_at: datetime = datetime.now()
        self.last_updated: datetime = datetime.now()
        
        self.redis_url = redis_url
        self.index_name = index_name
        
        self.embeddings = HuggingFaceBgeEmbeddings(model_name=EMBEDDING_MODEL_ID)
        self.vector_store = LangRedis(
            redis_url=redis_url,
            index_name=index_name,
            embedding=self.embeddings
        )
        
        self.redis_client = redis.Redis.from_url(redis_url)
        
        self.groq_client = Groq(api_key=groq_api_key)
        self.model = GROQ_MODEL_ID

    def get_conversation_history_text(self) -> str:
        if not self.turns:
            return ""
        
        history = []
        for turn in self.turns:
            history.append(f"User: {turn.question.content}")
            history.append(f"Assistant: {turn.answer.content}")
        
        return "\n\n".join(history)
        
    async def generate_response(self, 
                              question: str, 
                              max_tokens: int = 1024,
                              temperature: float = 0.3,
                              top_k: int = 3) -> str:
        try:
            search_results_with_scores = await self.vector_store.asimilarity_search_with_relevance_scores(
                question,
                k=top_k
            )
            
            search_results = []
            scores = []
            source_files = []
            
            for doc, score in search_results_with_scores:
                search_results.append(doc)
                scores.append(score)
                
                doc_id = doc.metadata.get('id', None)
                if not doc_id:
                    doc_id = getattr(doc, 'id', None)
                
                if doc_id:
                    source_filename = await self.get_source_filename(doc_id)
                else:
                    source_filename = 'unknown'
                    
                source_files.append(source_filename)
            
            formatted_contexts = []
            for i, (doc, score) in enumerate(zip(search_results, scores)):
                formatted_context = f"Document {i+1} (Score: {score:.3f})\n"
                formatted_context += f"Source: {source_files[i]}\n"
                formatted_context += f"Content:\n{doc.page_content}"
                formatted_contexts.append(formatted_context)
            
            context_str = "\n\n".join(formatted_contexts)
            
            conversation_history = self.get_conversation_history_text()
            
            prompt = PromptTemplate.create_prompt(
                question=question,
                context=context_str,
                conversation_history=conversation_history
            )
            
            response = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a research assistant specialized in analyzing academic papers and scientific literature."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=0.95,
                stream=False
            )
            
            contexts = [
                Context(
                    content=doc.page_content,
                    source=source_files[i],
                    relevance_score=scores[i]
                )
                for i, doc in enumerate(search_results)
            ]
            
            question_msg = Message(
                content=question,
                timestamp=datetime.now(),
                role='user'
            )
            
            answer_msg = Message(
                content=response.choices[0].message.content,
                timestamp=datetime.now(),
                role='assistant'
            )
            
            turn = ConversationTurn(
                question=question_msg,
                answer=answer_msg,
                context=contexts
            )
            
            self.turns.append(turn)
            self.last_updated = datetime.now()
            
            return response.choices[0].message.content
            
        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            print(error_msg)
            raise
    
    def get_history(self) -> List[Dict]:
        return [
            {
                'question': {
                    'content': turn.question.content,
                    'timestamp': turn.question.timestamp.isoformat(),
                    'role': turn.question.role
                },
                'answer': {
                    'content': turn.answer.content,
                    'timestamp': turn.answer.timestamp.isoformat(),
                    'role': turn.answer.role
                },
                'context': [
                    {
                        'content': ctx.content,
                        'source': ctx.source,
                        'relevance_score': ctx.relevance_score
                    }
                    for ctx in turn.context
                ]
            }
            for turn in self.turns
        ]
    
    async def get_source_filename(self, chunk_id: str) -> str:
        try:
            key_index = self.redis_client.ft('file-keys')
            results = key_index.search("*")
            
            if results.total == 0:
                return 'unknown'
            
            if ':' in chunk_id:
                chunk_id = chunk_id.split(':')[-1]
            
            for doc in results.docs:
                key_ids = doc.key_ids
                doc_ids = [kid.split(':')[-1] for kid in key_ids.split('#')]
                
                if chunk_id in doc_ids:
                    return doc.file_name
            
            return 'unknown'
            
        except Exception as e:
            print(f"Error looking up source filename: {str(e)}")
            return 'unknown'
    
    def to_dict(self) -> Dict:
        return {
            'conversation_id': self.conversation_id,
            'created_at': self.created_at.isoformat(),
            'last_updated': self.last_updated.isoformat(),
            'history': self.get_history()
        }

if __name__ == "__main__":
    import asyncio
    import os
    import json
    from dotenv import load_dotenv
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    from typing import Optional, List
    import pymongo
    from datetime import datetime
    from fastapi.middleware.cors import CORSMiddleware
    
    load_dotenv()
    
    MONGO_USERNAME = os.getenv("MONGO_USERNAME")
    MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
    MONGO_HOST = os.getenv("MONGO_HOST", "localhost")
    MONGO_PORT = os.getenv("MONGO_PORT", "27017")
    MONGO_DB = os.getenv("MONGO_DB", "rag_db")
    
    if MONGO_USERNAME and MONGO_PASSWORD:
        MONGO_URI = f"mongodb://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}"
    else:
        MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}"
    
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.server_info()
        print("Successfully connected to MongoDB")
        
        db = mongo_client[MONGO_DB]
        conversations_collection = db["conversations"]
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {str(e)}")
        raise Exception("Failed to connect to MongoDB")
    

    app = FastAPI(title="RAG Conversation API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    active_conversations: Dict[str, RAGConversation] = {}
    
    async def save_to_mongodb(conversation_data: dict):
        """Save conversation data to MongoDB."""
        try:
            if isinstance(conversation_data['created_at'], datetime):
                conversation_data['created_at'] = conversation_data['created_at'].isoformat()
            if isinstance(conversation_data['last_updated'], datetime):
                conversation_data['last_updated'] = conversation_data['last_updated'].isoformat()
            
            conversation_data['stored_at'] = datetime.now().isoformat()
            
            for turn in conversation_data.get('history', []):
                if 'question' in turn:
                    turn['question']['timestamp'] = turn['question']['timestamp'].isoformat() \
                        if isinstance(turn['question']['timestamp'], datetime) \
                        else turn['question']['timestamp']
                if 'answer' in turn:
                    turn['answer']['timestamp'] = turn['answer']['timestamp'].isoformat() \
                        if isinstance(turn['answer']['timestamp'], datetime) \
                        else turn['answer']['timestamp']
            
            result = conversations_collection.update_one(
                {'conversation_id': conversation_data['conversation_id']},
                {'$set': conversation_data},
                upsert=True
            )
            
            return True
            
        except Exception as e:
            print(f"Error saving to MongoDB: {str(e)}")
            return False
    
    class QuestionRequest(BaseModel):
        question: str
        max_tokens: Optional[int] = 1024
        temperature: Optional[float] = 0.1
        
    class SourceInfo(BaseModel):
        source: str
        relevance_score: float
        content: str
        
    class ConversationResponse(BaseModel):
        answer: str
        sources: List[SourceInfo]
        conversation_id: str
    
    @app.post("/conversation/new")
    async def start_new_conversation():
        try:
            new_conversation = RAGConversation(
                redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
                groq_api_key=os.getenv("GROQ_API_KEY")
            )
            
            active_conversations[new_conversation.conversation_id] = new_conversation
            
            return {"conversation_id": new_conversation.conversation_id}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/conversation/{conversation_id}", response_model=ConversationResponse)
    async def continue_conversation(conversation_id: str, request: QuestionRequest):
        try:
            conversation = active_conversations.get(conversation_id)
            
            if not conversation:
                stored_conversation = conversations_collection.find_one(
                    {"conversation_id": conversation_id}
                )
                
                if stored_conversation:
                    conversation = RAGConversation(
                        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
                        groq_api_key=os.getenv("GROQ_API_KEY")
                    )
                    conversation.conversation_id = stored_conversation['conversation_id']
                    active_conversations[conversation_id] = conversation
                else:
                    raise HTTPException(status_code=404, detail="Conversation not found")
            
            response = await conversation.generate_response(
                question=request.question,
                max_tokens=request.max_tokens,
                temperature=request.temperature
            )
            
            last_turn = conversation.turns[-1]
            
            sources = [
                SourceInfo(
                    source=ctx.source,
                    relevance_score=ctx.relevance_score,
                    content=ctx.content
                )
                for ctx in last_turn.context
            ]
            
            conversation_data = conversation.to_dict()
            save_success = await save_to_mongodb(conversation_data)
            
            if not save_success:
                print("Warning: Failed to save conversation to MongoDB")
            
            return ConversationResponse(
                answer=response,
                sources=sources,
                conversation_id=conversation.conversation_id
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/conversation/{conversation_id}")
    async def get_conversation_history(conversation_id: str):
        try:
            conversation = active_conversations.get(conversation_id)
            if conversation:
                return conversation.to_dict()
            
            stored_conversation = conversations_collection.find_one(
                {"conversation_id": conversation_id}
            )
            
            if stored_conversation:
                stored_conversation.pop('_id', None)
                return stored_conversation
                
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    @app.delete("/conversation/{conversation_id}")
    async def delete_conversation(conversation_id: str):
        try:
            active_conversations.pop(conversation_id, None)
            
            result = conversations_collection.delete_one(
                {"conversation_id": conversation_id}
            )
            
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Conversation not found")
                
            return {"message": "Conversation deleted successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/conversations")
    async def list_conversations(limit: int = 10, skip: int = 0):
        try:
            conversations = list(conversations_collection
                               .find({}, {'_id': 0})
                               .sort('created_at', -1)
                               .skip(skip)
                               .limit(limit))
            
            return {
                "total": conversations_collection.count_documents({}),
                "skip": skip,
                "limit": limit,
                "conversations": conversations
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    import uvicorn
    
    if __name__ == "__main__":
        uvicorn.run(app, host="0.0.0.0", port=9001)