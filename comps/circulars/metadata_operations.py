from pydantic import BaseModel
from typing import Optional
from fastapi import HTTPException, Request
from comps.mongo_client import mongo_client

collection = mongo_client['easy_circulars']['circulars']

class CircularUpdateData(BaseModel):
    circular_id: str
    bookmark: Optional[bool] = None
    conversation_id: Optional[str] = None 

def handle_circular_update(circularUpdate: CircularUpdateData):
    try:
        update_fields = {}
        if circularUpdate.bookmark is not None:
            update_fields["bookmark"] = circularUpdate.bookmark
        if circularUpdate.conversation_id is not None:
            update_fields["conversation_id"] = circularUpdate.conversation_id
        updated_result = collection.update_one(
            {"_id": circularUpdate.circular_id},
            {"$set": update_fields},
        )

        if updated_result.modified_count == 1:
            return True
        else:
            raise Exception("Not able to update the data.")

    except Exception as e:
        raise Exception(e)
    
def get_bookmarked_circulars() -> list[dict]:
    try:
        circulars: list = []
        cursor = collection.find({"bookmark": True})

        for document in cursor:
            document["circular_id"] = str(document["_id"])
            del document["_id"]
            circulars.append(document)
        return circulars

    except Exception as e:
        print(e)
        raise Exception(e)
    
def get_circular_by_id(circular_id) -> dict | None:
    try:

        main_circular = collection.find_one({"_id": circular_id})
        if not main_circular:
            return None

        references_ids = main_circular.get("references", [])

        referenced_circulars = []
        if references_ids:
            object_ids = [ref_id for ref_id in references_ids]
            cursor = collection.find({"_id": {"$in": object_ids}})
            referenced_circulars = cursor.to_list(length=len(references_ids))

            for ref in referenced_circulars:
                ref["circular_id"] = str(ref["_id"])

        main_circular["circular_id"] = str(main_circular["_id"])
        
        return {
            "circular": main_circular,
            "references": referenced_circulars
        }
    except Exception as e:
        print(f"Error fetching circular: {e}")
        return None
    
def get_all_circulars() -> list[dict]:
    try:
        circulars: list = []
        cursor = collection.find()

        for document in cursor:
            document["circular_id"] = str(document["_id"])
            del document["_id"]
            circulars.append(document)
        return circulars

    except Exception as e:
        print(e)
        raise Exception(e)
    
def handle_circular_get(request: Request):
    try:
        circular_id = request.query_params.get("circular_id")
        bookmark = request.query_params.get("bookmark", "false").lower() == "true"
        if bookmark:
            response = get_bookmarked_circulars()
        elif circular_id:
            response = get_circular_by_id(circular_id)
        else:
            response = get_all_circulars()

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
