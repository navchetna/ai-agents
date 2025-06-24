import argparse
import os
from comps.parsers.treeparser import TreeParser
from comps.parsers.tree import Tree

def main():
    parser = argparse.ArgumentParser(description="Parse PDF to Markdown and TOC using TreeParser.")
    parser.add_argument(
        "input_path",
        help="Path to the input PDF file",
        type=str,
    )
    parser.add_argument(
        "--output",
        dest="output_path",
        help="Optional output directory. Defaults to internal OUTPUT_DIR logic.",
        type=str,
        default=None,
    )

    args = parser.parse_args()

    if not os.path.isfile(args.input_path):
        print(f"Error: File not found - {args.input_path}")
        return

    tree = Tree(args.input_path)
    tree_parser = TreeParser()
    filename = tree_parser.get_filename(tree.file)

    tree_parser.generate_markdown(tree.file, filename, output_path=args.output_path)
    tree_parser.generate_toc(tree.file, filename, output_path=args.output_path)

if __name__ == "__main__":
    main()
