from treeparser import TreeParser

tree_parser = TreeParser("PDFs/DDPM-1-3.pdf")
tree_parser.generate_tree()
tree_parser.generate_output_json()
tree_parser.generate_output_text()