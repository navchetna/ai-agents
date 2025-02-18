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