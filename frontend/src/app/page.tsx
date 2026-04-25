"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import { Sparkles, Library, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string }[]>([]);

  const handleUploadComplete = (id: string, name: string) => {
    // Append to list of uploaded files so the RAG knows multiple files exist contexts
    setUploadedFiles(prev => {
        // Prevent duplicate name displays just in case
        if (prev.some(f => f.name === name)) return prev;
        return [...prev, { id, name }];
    });
  };

  return (
    <main className="min-h-screen py-12 px-6 lg:px-8 max-w-6xl mx-auto flex flex-col">
      {/* Header */}
      <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>AI Powered Multi-RAG</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-400">
            Document Intelligence
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Upload multiple PDF documents and ask questions. Our AI aggregates text across all loaded PDFs to provide answers strictly grounded in your documents.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-2"><Library size={16} /> FAISS</div>
          <div className="w-1 h-1 rounded-full bg-neutral-600"></div>
          <div className="flex items-center gap-2"><FileText size={16} /> Gemini 2.5</div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Upload & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              1. Add to Library
            </h2>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
               <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-200">
                <Library size={18} /> Active Documents
              </h2>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:w-1.5 transition-all"></div>
                        <CheckCircle2 size={16} className="text-green-500 ml-2" />
                        <span className="text-sm font-medium truncate flex-1 text-neutral-300">{f.name}</span>
                    </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl text-sm text-neutral-400 space-y-4">
            <h3 className="font-medium text-neutral-200">How it works</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Upload as many PDFs as you need. They append directly into Vector Memory.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Chunks are embedded using Google Gemini 2.5 and mapped into a collective FAISS store.
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                When you ask a question, the AI retrieves relevant chunks across ALL loaded context.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="lg:col-span-7 flex flex-col">
          {uploadedFiles.length > 0 ? (
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <ChatInterface activeFiles={uploadedFiles.map(f => f.name)} />
            </div>
          ) : (
            <div className="flex-1 glass rounded-2xl border border-white/10 border-dashed flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-neutral-500">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-medium text-neutral-300 mb-2">Awaiting Documents</h3>
              <p className="text-neutral-500 max-w-sm">
                Upload one or more PDF files first to start analyzing and querying their collective content.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
