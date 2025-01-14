import sys
from treeparser import TreeParser

if len(sys.argv) != 2:
    print("Please enter PDF name")
    sys.exit()

file = "pdfs/" + sys.argv[1]

tree_parser = TreeParser(file)
tree_parser.generate_tree()
tree_parser.generate_output_json()
tree_parser.generate_output_text()