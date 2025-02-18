# Copyright (C) 2024 Intel Corporation
# SPDX-License-Identifier: Apache-2.0
import os
from typing import List

from fastapi import HTTPException
from circular import Circular
from pydantic import BaseModel
from datetime import date
from comps import CustomLogger
from comps import opea_microservices, register_microservice

logger = CustomLogger("circular_mongo")
logflag = os.getenv("LOGFLAG", False)


class CircularData(BaseModel):
    id: int
    title: str
    tags: List[str]
    date: date


@register_microservice(
    name="opea_service@circular_mongo",
    endpoint="/v1/circular/get",
    host="0.0.0.0",
    port=8000,
)
async def get_circulars():

    try:
        circular = Circular()
        response = await circular.get_all_circulars()
        
        logger.info(response)

        return response

    except Exception as e:
        logger.info(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    opea_microservices["opea_service@circular_mongo"].start()