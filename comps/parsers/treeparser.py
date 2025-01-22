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
from comps import CustomLogger
from comps.parsers.node import Node
from comps.core.utils import mkdirIfNotExists

OUTPUT_DIR = "out"

logger = CustomLogger("treeparser")
logflag = os.getenv("LOGFLAG", False)

class TreeParser:
    def __init__(self, file):
        self.__rootNode = None
        self.__recentNodeDict = SortedDict()
        self.__file = file
        self.__filename = os.path.splitext(os.path.basename(file))[0]
        self.__data = {}
        mkdirIfNotExists(OUTPUT_DIR)

    def generate_markdown(self):
        if not output_exists(os.path.join(OUTPUT_DIR, self.__filename), self.__filename):
            converter = PdfConverter(
                artifact_dict=create_model_dict(),
            )
            rendered = converter(self.__file)
            #os.mkdir(os.path.join(OUTPUT_DIR, self.__filename))
            os.makedirs(os.path.join(OUTPUT_DIR, self.__filename), exist_ok=True)
            save_output(rendered, os.path.join(OUTPUT_DIR, self.__filename), self.__filename)
            if logflag:
                logger.info("Output generated")

                
    def get_headings(self):
        """Extract headings from markdown file in output directory"""
        headings = []
        md_path = os.path.join(OUTPUT_DIR, self.__filename, f"{self.__filename}.md")
        
        if not os.path.exists(md_path):
            self.generate_markdown()
        
        with open(md_path, 'r', encoding='utf-8') as file:
            for line in file:
                if line.startswith('#'):
                    # Remove # and whitespace
                    title = line.strip().lstrip('#').strip()
                    if not title: # skip empty headings
                        continue 
                    headings.append({'title': title})
        
        return headings

    def detect_level(self, headings):
        level_pattern = re.compile(r'^\d+(\.\d+)*\.?\s')
        for heading in headings:
            if level_pattern.match(heading['title']):
                return True
        return False
    
    """def generate_toc_using_level(self, headings):
        file = open(os.path.join(OUTPUT_DIR, self.__filename, 'toc.txt'), 'w')
        original_stdout = sys.stdout
        sys.stdout = file

        level_pattern = re.compile(r'^\d+(\.\d+)*\.?\s')

        for heading in headings:
            if level_pattern.match(heading['title']):
                heading_number, title = heading['title'].split(" ", 1)
                level = heading_number.count(".") + 1
                print(level, heading['title'], None, None, None, sep=';')
        sys.stdout = original_stdout
        file.close()"""
        
    def generate_toc_using_level(self, headings):
        file = open(os.path.join(OUTPUT_DIR, self.__filename, 'toc.txt'), 'w')
        original_stdout = sys.stdout
        sys.stdout = file

        # Pattern for regular numbered headings
        level_pattern = re.compile(r'^\d+(\.\d+)*\.?\s')
        # Pattern for Roman numerals
        roman_pattern = re.compile(r'^(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})\.\s')
        
        # Dictionary for Roman numeral conversion
        roman_values = {
            'I': 1, 'V': 5, 'X': 10, 'L': 50,
            'C': 100, 'D': 500, 'M': 1000
        }

        def roman_to_int(roman):
            total = 0
            prev_value = 0
            
            for char in reversed(roman):
                curr_value = roman_values[char]
                if curr_value >= prev_value:
                    total += curr_value
                else:
                    total -= curr_value
                prev_value = curr_value
            return total

        for heading in headings:
            title = heading['title']
            if level_pattern.match(title):
                # Handle regular numbered headings
                heading_number, content = title.split(" ", 1)
                level = heading_number.count(".") + 1
                print(level, title, None, None, None, sep=';')
            elif roman_pattern.match(title):
                # Handle Roman numeral headings
                parts = title.split(" ", 1)
                if len(parts) == 2:
                    heading_number, content = parts
                    # Remove the trailing dot if present
                    roman_num = heading_number.rstrip('.')
                    # Convert roman numeral to level number (I = 1, II = 1, etc.)
                    level = 1  # Top level for Roman numerals
                    print(level, title, None, None, None, sep=';')
        sys.stdout = original_stdout
        

    def generate_toc_using_size(self, headings):

        file = open(os.path.join(OUTPUT_DIR, self.__filename, 'toc.txt'), 'w')
        original_stdout = sys.stdout
        sys.stdout = file

        dictLevel = SortedDict()
        list_headings = []

        for heading in headings:
            if 'polygon' not in heading or not heading['polygon']:
                continue
            size = round(heading['polygon'][2][1] - heading['polygon'][0][1], 1)
            if size <=0:
                continue
            heading['title'] = heading['title'].replace("\n", " ").strip()
            if not heading['title']: #skip empty headings
                continue 
            idx = -1
            prevLevel = 0
            sizeLesserFound = False
            for key in reversed(dictLevel):
                if size == key or size - 1 == key:
                    idx = key
                    break
                if size - 1 > key:
                    prevLevel = dictLevel[key] - 1
                    sizeLesserFound = True
                    break
                prevLevel = dictLevel[key]
            if sizeLesserFound:
                for key in reversed(dictLevel):
                    if size - 1 > key:
                        dictLevel[key] += 1
                for i in list_headings:
                    if size - 1 > i[0]:
                        i[1] += 1
            if idx == -1:
                idx = size
                dictLevel[size] = prevLevel + 1
            lis = [idx, dictLevel[idx], heading['title']]
            list_headings.append(lis)

        for i in list_headings:
            print(i[1], i[2], None, None, None, sep=';')
        sys.stdout = original_stdout

    def generate_toc_no_outline(self):
        with open(os.path.join(OUTPUT_DIR, self.__filename, self.__filename + "_meta.json"), 'r') as file:
            data = json.load(file)

        headings = data['table_of_contents']
        if self.detect_level(headings):
            self.generate_toc_using_level(headings)
        else:
            self.generate_toc_using_size(headings)        
    
    def generate_toc(self):

        file = open(os.path.join(OUTPUT_DIR, self.__filename, 'toc.txt'), 'w')
        sys.stdout = file

        with open(self.__file, "rb") as fp:
            try:
                parser = PDFParser(fp)
                document = PDFDocument(parser)
                outlines = document.get_outlines()
                for (level, title, dest, a, se) in outlines:
                    print(level, title, dest, a, se, sep=';')
            except PDFNoOutlines:
                self.generate_toc_no_outline()
            except PDFSyntaxError:
                if logflag:
                    logger.info("Corrupted PDF or non-PDF file.")
            finally:
            parser.close()


    def parse_markdown(self):
        toc_file = open(os.path.join(OUTPUT_DIR, self.__filename, "toc.txt"), "r")
        toc_line = toc_file.readline()
                
        currNode = self.__rootNode

        with open(os.path.join(OUTPUT_DIR, self.__filename, self.__filename + ".md"), 'r') as markdown_file:
            for line in markdown_file:
                if line == "\n":
                    continue
                if bool(re.match(r'^#+', line)):
                    _, heading = line.split(" ", 1)
                    if not toc_line:
                        continue
                    level, heading_toc, _, _, _ = toc_line.split(";")
                    heading = heading.strip()

                    if heading_toc.lower() in heading.lower():
                        node = Node(level, heading, os.path.join(OUTPUT_DIR, self.__filename))
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
        with open(os.path.join(OUTPUT_DIR, self.__filename, "output.txt"), "w") as f:
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

        with open(os.path.join(OUTPUT_DIR, self.__filename, "output.json"), "w") as outfile: 
            json.dump(self.__data, outfile)

    def generate_tree(self):
        self.generate_markdown()
        self.generate_toc()

        self.__rootNode = Node('0', "root", os.path.join(OUTPUT_DIR, self.__filename))
        self.__recentNodeDict['0'] = self.__rootNode

        self.parse_markdown()
    
    def get_output_path(self):
        return os.path.join(OUTPUT_DIR, self.__filename, "output.txt")
