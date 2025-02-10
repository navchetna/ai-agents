from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import output_exists, save_output
from sortedcontainers import SortedDict
from pdfminer.pdfparser import PDFParser, PDFSyntaxError
from pdfminer.pdfdocument import PDFDocument, PDFNoOutlines
from difflib import SequenceMatcher
import re
import json 
import os
from comps import CustomLogger
from comps.parsers.node import Node
from comps.parsers.text import Text
from comps.parsers.table import Table
from comps.core.utils import mkdirIfNotExists

OUTPUT_DIR = "out"
NCERT_TOC_DIR = "../parsers/ncert_toc"

logger = CustomLogger("treeparser")

class TreeParser:
    def __init__(self):
        mkdirIfNotExists(OUTPUT_DIR)

    def get_filename(self, file):
        return os.path.splitext(os.path.basename(file))[0]

    def generate_markdown(self, file, filename):
        if not output_exists(os.path.join(OUTPUT_DIR, filename), filename):
            converter = PdfConverter(
                artifact_dict=create_model_dict(),
            )
            rendered = converter(file)
            os.mkdir(os.path.join(OUTPUT_DIR, filename))
            save_output(rendered, os.path.join(OUTPUT_DIR, filename), filename)
            logger.info("Output generated")

    def detect_level(self, headings):
        level_pattern = re.compile(r'^\d+(\.\d+)*\.?\s')
        for heading in headings:
            if level_pattern.match(heading['title']):
                return True
        return False
    
    def generate_toc_using_level(self, filename, headings):

        with open(os.path.join(OUTPUT_DIR, filename, 'toc.txt'), 'w') as file_toc:

            level_pattern = re.compile(r'^\d+(\.\d+)*\.?\s')

            for heading in headings:
                if level_pattern.match(heading['title']):
                    heading_number, title = heading['title'].split(" ", 1)
                    level = heading_number.count(".") + 1
                    file_toc.write(f"{level};{heading['title']}\n")

    def generate_toc_using_size(self, filename, headings):

        with open(os.path.join(OUTPUT_DIR, filename, 'toc.txt'), 'w') as file:

            dictLevel = SortedDict()
            list_headings = []

            for heading in headings:
                size = round(heading['polygon'][2][1] - heading['polygon'][0][1])
                heading['title'] = heading['title'].replace("\n", " ")
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
                file.write(f"{i[1]};{i[2]};;;\n")

    def generate_toc_no_outline(self, filename):
        with open(os.path.join(OUTPUT_DIR, filename, filename + "_meta.json"), 'r') as file_meta:
            data = json.load(file_meta)

        headings = data['table_of_contents']
        if self.detect_level(headings):
            self.generate_toc_using_level(filename, headings)
        else:
            self.generate_toc_using_size(filename, headings)        
    
    def generate_toc(self, file, filename):
        if "grade" in filename:
            return
        with open(os.path.join(OUTPUT_DIR, filename, 'toc.txt'), 'w') as file_toc:
            with open(file, "rb") as fp:
                try:
                    parser = PDFParser(fp)
                    document = PDFDocument(parser)
                    outlines = document.get_outlines()
                    for (level, title, dest, a, se) in outlines:
                        file_toc.write(f"{level};{title}\n")
                except PDFNoOutlines:
                    self.generate_toc_no_outline(filename)
                except PDFSyntaxError:
                    logger.info("Corrupted PDF or non-PDF file.")
                finally:
                    parser.close()

    def peek_next_lines(self, f):
        pos = f.tell()
        line = f.readline()
        line_2 = f.readline()
        f.seek(pos)
        return line, line_2

    def parse_markdown(self, filename, rootNode, recentNodeDict):
        toc_file = None

        if "grade" in filename:
            toc_file = open(os.path.join(NCERT_TOC_DIR, f"{filename}.txt"), "r")
        else:
            toc_file = open(os.path.join(OUTPUT_DIR, filename, "toc.txt"), "r")
        toc_line = toc_file.readline()
                
        currNode = rootNode

        tables = []

        content = ""

        previous_line = ""

        with open(os.path.join(OUTPUT_DIR, filename, filename + ".md"), 'r') as markdown_file:
            line = markdown_file.readline()
            while line:
                line = re.sub(r'<span[^>]*?\/?>(</span>)?', '', line)
                if line == "\n":
                    line = markdown_file.readline()
                    continue
                if bool(re.match(r'^#+', line)):
                    _, heading = line.split(" ", 1)
                    if not toc_line:
                        line = markdown_file.readline()
                        continue
                    level, heading_toc = toc_line.split(";")
                    heading = heading.strip().replace("*", "")
                    if (SequenceMatcher(None, "contents", heading_toc.lower())).ratio() > 0.6:
                        toc_line = toc_file.readline()
                        level, heading_toc = toc_line.split(";")
                    elif SequenceMatcher(None, heading.lower(), heading_toc.lower()).ratio() > 0.6:
                        node = Node(level, heading, os.path.join(OUTPUT_DIR, filename))
                        if level > currNode.get_level():
                            currNode.append_child(node)
                            node.set_parent(currNode)
                        else:
                            parent_key = -1
                            for key in reversed(recentNodeDict):
                                if key < node.get_level():
                                    parent_key = key
                                    break
                            recentNodeDict[parent_key].append_child(node)
                            node.set_parent(recentNodeDict[parent_key])
                            recentNodeDict[node.get_level()] = node
                        text_obj = Text(content, currNode)
                        currNode.append_content(text_obj)
                        for table in tables:
                            currNode.append_content(table)
                        tables.clear()
                        content = ""
                        currNode = node
                        toc_line = toc_file.readline()  
                    else:
                        content += line    
                elif line[0] == '|':
                    table_list = []
                    table_list.append(line)
                    while self.peek_next_lines(markdown_file)[0][0] == '|':
                        line = markdown_file.readline()
                        table_list.append(line)
                    next_line = self.peek_next_lines(markdown_file)[1].split('>', 1)
                    if len(next_line) > 1:
                        next_line = next_line[1]
                    else:
                        next_line = next_line[0]
                    pattern_table_heading = re.compile(r'^(Table|Figure)\s+(\d+)', re.IGNORECASE) 
                    match_table_heading_previous = pattern_table_heading.search(previous_line)
                    match_table_heading_next = pattern_table_heading.search(next_line)
                    heading = ""
                    if match_table_heading_previous:
                        heading = previous_line
                    elif match_table_heading_next:
                        heading = next_line
                    table_obj = Table("".join(table_list), heading, currNode)
                    tables.append(table_obj)
                else:
                    pattern_heading = re.compile(r'^(Table|Figure)\s+(\d+)', re.IGNORECASE)
                    match_heading = pattern_heading.search(line)
                    if not match_heading:
                        content += line
                previous_line = line
                line = markdown_file.readline()
                if not line:
                    text_obj = Text(content, currNode)
                    currNode.append_content(text_obj)
                    for table in tables:
                        currNode.append_content(table)

        if toc_file.readline():
            logger.warning("PDF not parsed accurately")

    def traverse_tree_text(self, node):
        if node == None:
            return
        
        node.output_node_info()

        total = node.get_length_children()

        for i in range(total):
            self.traverse_tree_text(node.get_child(i))
        
    def generate_output_text(self, tree):
        filename = self.get_filename(tree.file)
        with open(os.path.join(OUTPUT_DIR, filename, "output.txt"), "w") as f:
            f.write("")
        self.traverse_tree_text(tree.rootNode)

    def traverse_tree_json(self, node):
        if node == None:
            return
        
        data = {}

        heading = node.get_heading()

        data[heading] = {}
        data[heading]['content'] = []

        content = node.get_content()
        for item in content:
            if isinstance(item, Text):
                data[heading]['content'].append(item.content)
            if isinstance(item, Table):
                data[heading]['content'].append(item.markdown_content)

        data[heading]['children'] = []
        
        total = node.get_length_children()

        for i in range(total):
            data[heading]['children'].append(self.traverse_tree_json(node.get_child(i)))
        
        return data

    def generate_output_json(self, tree):
        data = self.traverse_tree_json(tree.rootNode)
        filename = self.get_filename(tree.file)

        with open(os.path.join(OUTPUT_DIR, filename, "output.json"), "w") as outfile: 
            json.dump(data, outfile)

    def populate_tree(self, tree):
        rootNode = tree.rootNode
        file = tree.file
        filename = self.get_filename(file)
        self.generate_markdown(file, filename)
        self.generate_toc(file, filename)

        recentNodeDict = {}
        recentNodeDict['0'] = rootNode

        self.parse_markdown(filename, rootNode, recentNodeDict)
    
    def get_output_path(self, tree):
        filename = self.get_filename(tree.file)
        return os.path.join(OUTPUT_DIR, filename, "output.txt")
