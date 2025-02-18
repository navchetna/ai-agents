# comps package

from comps.core.logger import CustomLogger
from comps.proto.docarray import (
  DocPath,
  EmbedDoc,
    EmbedMultimodalDoc,
    SearchedDoc,
    SearchedMultimodalDoc,
    TextDoc,
)
from comps.core.microservice import opea_microservices, register_microservice, MicroService
from comps.core.constants import MegaServiceEndpoint, ServiceRoleType, ServiceType
from comps.core.base_statistics import statistics_dict, register_statistics
from comps.core.orchestrator import ServiceOrchestrator