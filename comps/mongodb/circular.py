# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

from integrations.mongo.config import COLLECTION_NAME
from integrations.mongo.mongo_conn import MongoClient

class Circular:

    def __init__(
        self,
    ):
        self.db_client = MongoClient.get_db_client()
        self.collection = self.db_client[COLLECTION_NAME]

    async def get_all_circulars(self) -> list[dict]:
        try:
            circulars: list = []
            cursor = self.collection.find()

            async for document in cursor:
                document["circular_id"] = str(document["_id"])
                del document["_id"]
                circulars.append(document)
            return circulars

        except Exception as e:
            print(e)
            raise Exception(e)
        
    async def get_circular_by_id(self, circular_id) -> dict | None:
        try:

            main_circular = await self.collection.find_one({"_id": circular_id})
            if not main_circular:
                return None

            references_ids = main_circular.get("references", [])

            referenced_circulars = []
            if references_ids:
                object_ids = [ref_id for ref_id in references_ids]
                cursor = self.collection.find({"_id": {"$in": object_ids}})
                referenced_circulars = await cursor.to_list(length=len(references_ids))

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
        
    async def get_bookmarked_circulars(self) -> list[dict]:
        try:
            circulars: list = []
            cursor = self.collection.find({"bookmark": True})

            async for document in cursor:
                document["circular_id"] = str(document["_id"])
                del document["_id"]
                circulars.append(document)
            return circulars

        except Exception as e:
            print(e)
            raise Exception(e)
        
    async def update_circular(self, circular_data) -> bool:
        try:
            update_fields = {}
            if circular_data.bookmark is not None:
                update_fields["bookmark"] = circular_data.bookmark
            if circular_data.conversation_id is not None:
                update_fields["conversation_id"] = circular_data.conversation_id
            updated_result = await self.collection.update_one(
                {"_id": circular_data.circular_id},
                {"$set": update_fields},
            )

            if updated_result.modified_count == 1:
                print(f"Updated document: {circular_data.circular_id} !")
                return True
            else:
                raise Exception("Not able to update the data.")

        except Exception as e:
            print(e)
            raise Exception(e)    