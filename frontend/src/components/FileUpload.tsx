"use client";

import { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, X, CheckCircle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUpload({ onUploadComplete }: { onUploadComplete: (docId: string, filename: string) => void }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUploadComplete(res.data.document_id, file.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        className={`glass relative rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer ${isHovering ? "border-primary bg-primary/10 scale-105" : "border-white/20 hover:border-white/40"}`}
      >
        <input 
          type="file" 
          accept=".pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 rounded-full border-b-2 border-t-2 border-primary animate-spin"></div>
              <p className="text-sm text-muted-foreground font-medium">Extracting texts & computing embeddings...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center space-y-4">
              <div className="bg-primary/20 p-4 rounded-full text-primary">
                <UploadCloud size={40} />
              </div>
              <div>
                <p className="text-xl font-semibold mb-1">Drag and drop your PDF here</p>
                <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
          <X size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
