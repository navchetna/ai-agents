from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import output_exists, save_output
from sortedcontainers import SortedDict
import toc
import re
import sys
import os

file = "PDFs/DDPM-1-3.pdf"

filename = file.split(".")[0].split("/")[1]

if not output_exists("outputs/" + filename, filename):
    converter = PdfConverter(
        artifact_dict=create_model_dict(),
    )
    rendered = converter(file)
    os.mkdir("outputs/" + filename)
    save_output(rendered, "outputs/" + filename, filename)
    print("Output generated")

toc.generate_toc(file)

class Node:
    def __init__(self):
        self.level = "0"
        self.heading = ""
        self.content = []
        self.children = []

dictNode = SortedDict()

rootNode = Node()
rootNode.heading = "root"
currNode = rootNode
dictNode['0'] = [rootNode]

toc_file = open("toc.txt", "r")
toc_line = toc_file.readline()

with open('outputs/' + filename + "/" + filename + '.md', 'r') as markdown_file:
    for line in markdown_file:
        if bool(re.match(r'^#+', line)):
            _, heading = line.split(" ", 1)
            level, heading_toc, _, _, _ = toc_line.split(";")
            heading = heading.strip()
            if heading_toc in heading:
                node = Node()
                node.heading = heading
                node.level = level
                if level > currNode.level:
                    currNode.children.append(node)
                else:
                    parent_key = -1
                    for key in reversed(dictNode):
                        if key < node.level:
                            parent_key = key
                            break
                    dictNode[parent_key][-1].children.append(node)
                if node.level not in dictNode:
                    dictNode[node.level] = [node]
                else:
                    dictNode[node.level].append(node)
                currNode = node
                toc_line = toc_file.readline()       
        else:
            currNode.content.append(line)

def inorder(node):

    if node == None:
        return
    
    data = {}

    data[node.heading] = {}

    data[node.heading]['content'] = node.content
    data[node.heading]['children'] = []
    
    total = len(node.children)

    for i in range(total):
        data[node.heading]['children'].append(inorder(node.children[i]))
    
    return data

output_file = open('output.txt', 'w')
sys.stdout = output_file

print(inorder(rootNode))

output_file.close()
