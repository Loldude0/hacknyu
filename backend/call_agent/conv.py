import os
from pypdf import PdfReader
import re

def pdf_to_markdown(pdf_directory, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for filename in os.listdir(pdf_directory):
            if filename.lower().endswith('.pdf'):
                pdf_path = os.path.join(pdf_directory, filename)
                try:
                    reader = PdfReader(pdf_path)
                    # Add file header as H1
                    outfile.write(f"# {filename}\n\n")
                    
                    for page_num, page in enumerate(reader.pages, 1):
                        text = page.extract_text()
                        
                        # Clean up the text
                        # Remove excessive whitespace
                        text = re.sub(r'\s+', ' ', text).strip()
                        
                        # Try to detect headers (all caps lines)
                        lines = text.split('\n')
                        markdown_text = ""
                        
                        for line in lines:
                            line = line.strip()
                            if line:
                                # If line is all caps and shorter than 100 chars, treat as header
                                if line.isupper() and len(line) < 100:
                                    markdown_text += f"\n## {line.title()}\n\n"
                                else:
                                    markdown_text += line + "\n\n"
                        
                        # Add page number as H3
                        outfile.write(f"### Page {page_num}\n\n")
                        outfile.write(markdown_text)
                        outfile.write("\n---\n\n")  # Page separator
                        
                    print(f"Processed: {filename}")
                    
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")

# Usage
pdf_dir = "files"  # Your PDF directory
output_file = "combined.md"  # Output markdown file
pdf_to_markdown(pdf_dir, output_file)