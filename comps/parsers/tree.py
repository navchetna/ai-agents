import os
from comps.parsers.node import Node

OUTPUT_DIR = "out"

class Tree:
    def __init__(self, file):
        self.rootNode = Node('0', "root", os.path.join(OUTPUT_DIR, os.path.splitext(os.path.basename(file))[0]))
        self.file = file
    