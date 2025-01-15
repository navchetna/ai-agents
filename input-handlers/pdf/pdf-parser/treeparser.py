from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import output_exists, save_output
from sortedcontainers import SortedDict
from pdfminer.pdfparser import PDFParser, PDFSyntaxError
from pdfminer.pdfdocument import PDFDocument, PDFNoOutlines
from difflib import SequenceMatcher
import sys
import re
import json 
import os

class Node:
    def __init__(self, level, heading):
        self.__level = level
        self.__heading = heading
        self.__parent = None
        self.__content = []
        self.__children = []

    def get_level(self):
        return self.__level
    
    def get_heading(self):
        return self.__heading
    
    def get_content(self):
        return self.__content
    
    def set_parent(self, node):
        self.__parent = node

    def append_child(self, node):
        self.__children.append(node)

    def append_content(self, line):
        self.__content.append(line)

    def get_length_children(self):
        return len(self.__children)
    
    def get_child(self, pos):
        return self.__children[pos]
    
    def output_node_info(self):
        with open("output.txt", "a") as f:
            f.write(self.__heading + "\n")
            for line in self.__content:
                f.write(line)
            f.write("\n")

class TreeParser:
    def __init__(self, file):
        self.__rootNode = None
        self.__recentNodeDict = SortedDict()
        self.__file = file
        self.__filename = os.path.splitext(os.path.basename(file))[0]
        self.__data = {}

    def generate_markdown(self):
        if not os.path.isdir('outputs'):
            os.mkdir("outputs")
        if not output_exists("outputs/" + self.__filename, self.__filename):
            converter = PdfConverter(
                artifact_dict=create_model_dict(),
            )
            rendered = converter(self.__file)
            os.mkdir("outputs/" + self.__filename)
            save_output(rendered, "outputs/" + self.__filename, self.__filename)
            print("Output generated")

    def generate_toc(self):

        file = open('toc.txt', 'w')
        sys.stdout = file

        with open(self.__file, "rb") as fp:
            try:
                parser = PDFParser(fp)
                document = PDFDocument(parser)
                outlines = document.get_outlines()
                for (level, title, dest, a, se) in outlines:
                    print(level, title, dest, a, se, sep=';')
            except PDFNoOutlines:
                print("No outlines found.")
            except PDFSyntaxError:
                print("Corrupted PDF or non-PDF file.")
            finally:
                parser.close()

        file.close()

    def parse_markdown(self):
        toc_file = open("toc.txt", "r")
        toc_line = toc_file.readline()
                
        currNode = self.__rootNode

        with open('outputs/' + self.__filename + "/" + self.__filename + '.md', 'r') as markdown_file:
            for line in markdown_file:
                if line == "\n":
                    continue
                if bool(re.match(r'^#+', line)):
                    _, heading = line.split(" ", 1)
                    if not toc_line:
                        continue
                    level, heading_toc, _, _, _ = toc_line.split(";")
                    heading = heading.strip()

                    if SequenceMatcher(None, heading, heading_toc).ratio() > 0.7:
                        node = Node(level, heading)
                        if level > currNode.get_level():
                            currNode.append_child(node)
                            node.set_parent(currNode)
                        else:
                            parent_key = -1
                            for key in reversed(self.__recentNodeDict):
                                if key < node.get_level():
                                    parent_key = key
                                    break
                            self.__recentNodeDict[parent_key].append_child(node)
                            node.set_parent(self.__recentNodeDict[parent_key])
                            self.__recentNodeDict[node.get_level()] = node
                        currNode = node
                        toc_line = toc_file.readline()       
                else:
                    currNode.append_content(line)

    def traverse_tree_text(self, node):
        if node == None:
            return
        
        node.output_node_info()

        total = node.get_length_children()

        for i in range(total):
            self.traverse_tree_text(node.get_child(i))

        
    def generate_output_text(self):
        with open("output.txt", "w") as f:
            f.write("")
        self.traverse_tree_text(self.__rootNode)

    def traverse_tree_json(self, node):
        if node == None:
            return
        
        data = {}

        heading = node.get_heading()

        data[heading] = {}

        data[heading]['content'] = node.get_content()
        data[heading]['children'] = []
        
        total = node.get_length_children()

        for i in range(total):
            data[heading]['children'].append(self.traverse_tree_json(node.get_child(i)))
        
        return data

    def generate_output_json(self):
        if not self.__data:
            self.__data = self.traverse_tree_json(self.__rootNode)

        with open("output.json", "w") as outfile: 
            json.dump(self.__data, outfile)

    def generate_tree(self):
        self.generate_markdown()
        self.generate_toc()

        self.__rootNode = Node('0', "root")
        self.__recentNodeDict['0'] = self.__rootNode

        self.parse_markdown()
