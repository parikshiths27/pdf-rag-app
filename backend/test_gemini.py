import os, sys, traceback
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.getcwd())
from rag.pipeline import RAGPipeline
p = RAGPipeline()
p._init_models()
try:
    print(p.llm.generate_content('test').text)
except Exception as e:
    traceback.print_exc()
