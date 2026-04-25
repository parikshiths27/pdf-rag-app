"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatInterface({ activeFiles }: { activeFiles: string[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I have analyzed **${activeFiles.length} document(s)**. Ask me any questions about them.`,
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await axios.post(`${apiUrl}/query`, { query: userMsg.content });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.answer,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please ensure the backend is running and the API key is valid."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="text-primary" size={24} />
          <h2 className="font-semibold tracking-wide">Document Assistant</h2>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30">
          <CheckCircle2 size={14} />
          <span className="truncate max-w-[150px]">{activeFiles.length === 1 ? activeFiles[0] : `${activeFiles.length} Docs`} Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-neutral-700 text-white"}`}>
              {msg.role === "assistant" ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={`flex flex-col max-w-[80%] ${msg.role === "assistant" ? "items-start" : "items-end"}`}>
              <div className={`p-4 rounded-2xl ${msg.role === "assistant" ? "bg-white/5 border border-white/10 text-neutral-200" : "bg-primary text-primary-foreground"}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              
              {/* Show sources if assistant has them */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((src, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-neutral-400">
                      <FileText size={12} />
                      {src}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-neutral-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 bg-black/40 border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-neutral-500"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-1 top-1 h-[calc(100%-8px)] w-10 flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="-ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
