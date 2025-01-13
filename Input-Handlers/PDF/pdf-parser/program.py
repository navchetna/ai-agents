import sys
from treeparser import TreeParser

if len(sys.argv) != 2:
    print("Please enter PDF name")
    sys.exit()

file = "PDFs/" + sys.argv[1]

tree_parser = TreeParser("PDFs/DDPM-1-3.pdf")
tree_parser.generate_tree()
tree_parser.generate_output_json()
tree_parser.generate_output_text()