
from pymongo import MongoClient
from bson import ObjectId


document_schema = {
    "_id": "ObjectId",
    "sourceLink": "String",
    "summary": "String",
    "tags": ["String"]
}

conversation_schema = {
    "_id": "ObjectId",
    "userId": "ObjectId", 
    "question": "String",
    "context": "ObjectId",
    "answer": "String",
    "feedback": "String"
}

user_schema = {
    "_id": "ObjectId",
    "name": "String",
    "email": "String"
}

document_review_schema = {
    "_id": "ObjectId",
    "userId": "ObjectId", 
    "documentId": "ObjectId", 
    "highlightedSections": [
        {
            "section": "String",
            "metadata": {
                "page": "Number",
                "start": "Number",
                "end": "Number"
            }
        }
    ]
}

document_example = {
    "_id": "ObjectId('64b64cfc3a4d2e1d3f8fbc1a')",
    "sourceLink": "https://drive.google.com/document1.pdf",
    "summary": "This research explores the impact of semantic search in modern information retrieval systems.",
    "tags": ["Semantic Search", "Information Retrieval"]
}
conversation_example = {
    "_id": "ObjectId('64b64d7c3a4d2e1d3f8fbc1b')",
    "userId": "ObjectId('64b64cfc3a4d2e1d3f8fbc1c')",
    "question": "What is semantic search?",
    "documentId": "ObjectId('64b64cfc3a4d2e1d3f8fbc1a')",
    "answer": "Semantic search focuses on user intent, enabling better search results.",
    "feedback": "Good"
}
user_example = {
    "_id": "ObjectId('64b64d9c3a4d2e1d3f8fbc1d')",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com"
}
document_review_example = {
    "_id": "ObjectId('64b64dfc3a4d2e1d3f8fbc1f')",
    "userId": "ObjectId('64b64d9c3a4d2e1d3f8fbc1d')",
    "documentId": "ObjectId('64b64cfc3a4d2e1d3f8fbc1a')",
    "highlightedSections": [
        {
            "section": "Semantic search improves search accuracy by understanding user intent.",
            "metadata": {
                "page": 5,
                "start": 20,
                "end": 70
            }
        }
    ]
}

def create_collections():

    client = MongoClient("mongodb://agents:agents@localhost:27017")
    db = client["research_database"]

    db.create_collection("documents")
    db["documents"].create_index("_id")
    db["documents"].insert_one({
        "_id": ObjectId("64b64cfc3a4d2e1d3f8fbc1a"),
        "sourceLink": "https://drive.google.com/document1.pdf",
        "summary": "This document is an example pdf.",
        "tags": ["Semantic Search", "Information Retrieval"]
    })

    db.create_collection("conversations")
    db["conversations"].create_index("userId")
    db["conversations"].insert_one({
        "_id": ObjectId("64b64d7c3a4d2e1d3f8fbc1b"),
        "userId": ObjectId("64b64d9c3a4d2e1d3f8fbc1d"),
        "question": "What is semantic search?",
        "context": ObjectId("64b64cfc3a4d2e1d3f8fbc1a"),
        "answer": "Semantic search focuses on user intent, enabling better search results.",
        "feedback": "Good"
    })

    db.create_collection("users")
    db["users"].create_index("_id")
    db["users"].insert_one({
        "_id": ObjectId("64b64d9c3a4d2e1d3f8fbc1d"),
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com"
    })

    # EXAMPLE SCHEMA - change this acc to logic
    db.create_collection("document_reviews")
    db["document_reviews"].create_index("userId")
    db["document_reviews"].create_index("documentId")
    db["document_reviews"].insert_one({
        "_id": ObjectId("64b64dfc3a4d2e1d3f8fbc1f"), # this would be the object id
        "userId": ObjectId("64b64d9c3a4d2e1d3f8fbc1d"), # user 1's edit to the below pdf (example -> ervin highlights ONE section of UniMERN with cood/start and end chars)
        "documentId": ObjectId("64b64cfc3a4d2e1d3f8fbc1a"), # example the id of UniMERN.pdf
        "highlightedSections": [ # list keeps getting appended with the highlighted sections
            {
                "section": "Semantic search improves search accuracy by understanding user intent.",
                "metadata": {
                    "page": 5,
                    "start": 20,
                    "end": 70
                }
            }
        ]
    })

    print("Collections, indexes, and data created successfully!")


if __name__ == "__main__":
    create_collections()
