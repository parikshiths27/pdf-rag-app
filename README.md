# PDF RAG Application

An AI web application that allows users to upload PDF documents and ask questions based strictly on the uploaded content using a Retrieval-Augmented Generation (RAG) system with Google Gemini 1.5 Flash.

## Project Structure
- `/frontend` - Next.js App Router Web UI (Tailwind CSS, Framer Motion, Axios).
- `/backend` - FastAPI Python Server (PyMuPDF, Langchain, FAISS, Langchain Google GenAI).

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend Setup
1. Open terminal and navigate to backend:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Setup Environment Variable
   Create a `.env` file in the `backend` directory containing:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Run the FastAPI dev server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Open a new terminal and navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:3000`

## Deployment

### Frontend (Vercel)
1. Push your code to a GitHub repository.
2. Link your repository to Vercel.
3. Configure the Root Directory to `frontend`.
4. Deploy (Vercel automatically detects Next.js configurations).

### Backend (Render)
1. Connect your GitHub repo to Render and choose "New Web Service".
2. Select the `backend` directory as your root.
3. Use the generated `render.yaml` if using Blueprint, or manually set the Build command to `pip install -r requirements.txt` and Start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Add the `GEMINI_API_KEY` to Render's Environment Variables.
5. Deploy.
# pdf-rag-app
