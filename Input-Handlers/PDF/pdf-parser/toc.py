from pathlib import Path
from pdfminer.pdfparser import PDFParser, PDFSyntaxError
from pdfminer.pdfdocument import PDFDocument, PDFNoOutlines
import sys

def generate_toc(pdf):

    file_name = Path(pdf)

    file = open('toc.txt', 'w')
    sys.stdout = file

    with open(file_name, "rb") as fp:
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