import os
os.environ["GEMINI_API_KEY"] = "AIzaSyAnqMxaXKmg9thgjhCDzgpYXWhRUqBwEx0"
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
