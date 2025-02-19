# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0
import os
from typing import Optional

from fastapi import HTTPException
from circular import Circular
from pydantic import BaseModel
from datetime import date
from comps import CustomLogger
from comps import opea_microservices, register_microservice

logger = CustomLogger("circular_mongo")
logflag = os.getenv("LOGFLAG", False)


class CircularData(BaseModel):
    circular_id: Optional[str] = None
    bookmark: Optional[bool] = None

class CircularUpdateData(BaseModel):
    circular_id: str
    bookmark: Optional[bool] = None
    conversation_id: Optional[str] = None 

@register_microservice(
    name="opea_service@circular_mongo",
    endpoint="/v1/circular/update",
    host="0.0.0.0",
    input_datatype=CircularUpdateData,
    port=8000,
)
async def update_circular_data(circularUpdate: CircularUpdateData):
    try:
        circular = Circular()
        response = await circular.update_circular(circularUpdate)

        logger.info(response)
        return response

    except Exception as e:
        logger.info(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@register_microservice(
    name="opea_service@circular_mongo",
    endpoint="/v1/circular/get",
    host="0.0.0.0",
    input_datatype=CircularData,
    port=8000,
)
async def get_circular(circularData: CircularData):

    try:
        circular = Circular()
        if circularData.bookmark:
            response = await circular.get_bookmarked_circulars()
        elif circularData.circular_id:
            response = await circular.get_circular_by_id(circularData.circular_id)
        else:
            response = await circular.get_all_circulars()
        
        logger.info(response)

        return response

    except Exception as e:
        logger.info(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    opea_microservices["opea_service@circular_mongo"].start()