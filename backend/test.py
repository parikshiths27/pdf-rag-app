from dotenv import load_dotenv
load_dotenv()
import fitz
from rag.pipeline import RAGPipeline
import traceback

try:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Hello world text.")
    doc.save("test.pdf")
    doc.close()

    p = RAGPipeline()
    p.process_pdf("test.pdf", "test.pdf")
    print("Success")
except Exception as e:
    print("ERROR OCCURRED:")
    print(traceback.format_exc())
