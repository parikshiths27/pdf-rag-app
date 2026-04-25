from dotenv import load_dotenv
load_dotenv()
import fitz
from rag.pipeline import RAGPipeline
import traceback

try:
    p = RAGPipeline()
    p.process_pdf("test.pdf", "test.pdf")
    res = p.query("hi")
    print("Success:", res)
except Exception as e:
    print("ERROR OCCURRED:")
    print(traceback.format_exc())
