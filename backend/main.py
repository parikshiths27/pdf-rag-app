import os
import shutil
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from rag.pipeline import RAGPipeline

app = FastAPI(title="PDF RAG API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize single global pipeline instances
rag_pipeline = RAGPipeline()

class QueryRequest(BaseModel):
    query: str

class QuizRequest(BaseModel):
    num_questions: int = 5

@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Save file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        document_id = rag_pipeline.process_pdf(temp_file_path, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return {"message": "PDF uploaded and processed successfully", "document_id": document_id}

@app.post("/query")
def query_endpoint(req: QueryRequest):
    if not req.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        response = rag_pipeline.query(req.query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/quiz")
def quiz_endpoint(req: QuizRequest):
    try:
        result = rag_pipeline.generate_quiz(num_questions=req.num_questions)
        if result.get("quiz") is None:
            # Return error as JSON without crashing
            return {"quiz": None, "error": result.get("error", "Unknown error generating quiz.")}
        return result
    except Exception as e:
        return {"quiz": None, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
