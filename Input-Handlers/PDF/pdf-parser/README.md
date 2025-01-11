# Approach

1. Use the library `pdf2markdown` to convert the PDF file into a Markdown file.

2. Use the library `pdfminer` to create a Table of Contents.

3. Create a root node and a current node that points to the root node.

4. For each line in the Markdown file:
     - If the line is a heading:
       - Compare it with the current line the file pointer in the Table of Contents is pointing to.
       - If they match, create a node and append it as a child to the parent node based on the heading level. Assign the new node to the current node.
     - If the line is not a heading:
       - Append the line to the contents of the current node.

5. The output of the program is stored in `output.txt` and is a dictionary of the format:
```python
{
    'node heading': {
        'content': [],
        'children': {
            'child-1 node heading': {
                'content': [],
                'children': {}
            },
            'child-2 node heading': {
                'content': [],
                'children': {}
            }
        }
    }
}
```

# Document Types
This approach **should** work with documents that have an outline.

# Setup

## Clone repo
```bash
git clone https://github.com/navchetna/ai-agents
```

## Move to the pdf-parser folder
```bash
cd ai-agents/Input-Handlers/PDF/pdf-parser
```

## Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

## Install dependencies
```bash
pip install -r requirements.txt
```

## Run the program
```bash
python3 program.py
```

> Note:
> Please make sure to use WSL/Linux environment for running above
