import os
import fitz
import time
import json
from typing import List, Dict, Any

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai

class RAGPipeline:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
        
        self.embeddings = None
        self.llm = None
        
        self.vector_store = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        
    def _init_models(self):
        if self.embeddings is None:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-2",
                google_api_key=self.api_key
            )
        if self.llm is None:
            genai.configure(api_key=self.api_key)
            self.llm = genai.GenerativeModel('gemini-2.5-flash')

    def process_pdf(self, file_path: str, filename: str) -> str:
        self._init_models()
        doc = fitz.open(file_path)
        texts = []
        metadatas = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            if text and text.strip():
                texts.append(text.strip())
                metadatas.append({"source": filename, "page": page_num + 1})
        
        doc.close()
        
        if not texts:
            raise ValueError(f"No readable text found in {filename}.")
            
        docs = self.text_splitter.create_documents(texts, metadatas=metadatas)
        
        print(f"Adding {len(docs)} chunks sequentially to bypass Google API list-comp bug...")
        for i, d in enumerate(docs):
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents([d], self.embeddings)
            else:
                self.vector_store.add_documents([d])
            
        print(f"Finished embedding {filename} successfully.")
        return filename

    def query(self, question: str) -> Dict[str, Any]:
        self._init_models()
        if self.vector_store is None:
            return {"answer": "No documents uploaded yet.", "sources": []}
            
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        docs = retriever.invoke(question)
        
        context = "\n\n".join([f"[Source: {d.metadata.get('source')} Page {d.metadata.get('page')}] {d.page_content}" for d in docs])
        
        prompt_text = f"You are an expert document assistant. Answer ONLY from the provided context below. If the answer is not in the context, say 'Not found in the uploaded documents.' Do not hallucinate or use outside knowledge.\n\nContext:\n{context}\n\nUser Question:\n{question}"
        
        response = self.llm.generate_content(prompt_text)
        answer = response.text
        
        sources = list({f"{d.metadata.get('source')} (Page {d.metadata.get('page')})" for d in docs})
        
        return {
            "answer": answer,
            "sources": sources
        }

    def generate_quiz(self, num_questions: int = 5) -> Dict[str, Any]:
        """Generate a structured MCQ quiz from the loaded documents."""
        self._init_models()
        if self.vector_store is None:
            return {"quiz": None, "error": "No documents uploaded yet."}

        # Retrieve a broad sample of content for quiz generation
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 10})
        docs = retriever.invoke("key concepts topics main ideas summary")

        context = "\n\n".join([
            f"[Source: {d.metadata.get('source')} Page {d.metadata.get('page')}] {d.page_content}"
            for d in docs
        ])

        prompt_text = (
            f"You are a quiz generator. Based on the document content below, generate exactly {num_questions} "
            "multiple-choice questions.\n\n"
            "STRICT RULES:\n"
            "- Return ONLY valid JSON. No markdown, no code fences, no explanation.\n"
            "- The JSON must be a single array of objects.\n"
            "- Each object must have exactly these keys:\n"
            '  "question": a clear question string\n'
            '  "options": an array of exactly 4 distinct answer strings\n'
            '  "answer": the exact text of the correct option (must match one of the options exactly)\n\n'
            "Example format:\n"
            '[{"question":"What is X?","options":["A","B","C","D"],"answer":"B"}]\n\n'
            f"Document Content:\n{context}"
        )

        try:
            response = self.llm.generate_content(prompt_text)
            raw = response.text.strip()

            # Extract JSON array safely even if extra text is present
            start = raw.find("[")
            end = raw.rfind("]")

            if start != -1 and end != -1:
                raw = raw[start:end + 1]
            else:
                raise ValueError("No valid JSON array found in response.")

            for _ in range(2):
                try:
                    quiz_data = json.loads(raw)
                    break
                except Exception:
                    response = self.llm.generate_content(prompt_text)
                    raw = response.text.strip()

                    start = raw.find("[")
                    end = raw.rfind("]")

                    if start != -1 and end != -1:
                        raw = raw[start:end + 1]
                    else:
                        continue
            else:
                raise ValueError("Failed to parse quiz JSON after retry")

            # Validate structure
            if not isinstance(quiz_data, list):
                raise ValueError("Response is not a JSON array.")
            for item in quiz_data:
                if not all(k in item for k in ("question", "options", "answer")):
                    raise ValueError("Missing required keys in quiz item.")
                if not isinstance(item["options"], list) or len(item["options"]) != 4:
                    raise ValueError("Each question must have exactly 4 options.")

            return {"quiz": quiz_data}

        except (json.JSONDecodeError, ValueError) as e:
            return {
                "quiz": None,
                "error": f"Failed to parse quiz response: {str(e)}"
            }
