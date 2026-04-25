"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizBlockProps {
  questions: QuizQuestion[];
}

interface QuestionState {
  selected: string | null;
}

export default function QuizBlock({ questions }: QuizBlockProps) {
  const [states, setStates] = useState<QuestionState[]>(
    questions.map(() => ({ selected: null }))
  );

  const handleSelect = (qIndex: number, option: string) => {
    // Ignore if already answered
    if (states[qIndex].selected !== null) return;
    setStates((prev) =>
      prev.map((s, i) => (i === qIndex ? { selected: option } : s))
    );
  };

  const score = states.filter(
    (s, i) => s.selected === questions[i].answer
  ).length;
  const answered = states.filter((s) => s.selected !== null).length;

  return (
    <div className="w-full space-y-6 mt-2">
      {/* Score bar — only shown once at least one question is answered */}
      {answered > 0 && (
        <div className="flex items-center justify-between text-xs text-neutral-400 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <span>
            {answered} / {questions.length} answered
          </span>
          <span className="font-semibold text-neutral-200">
            Score: {score} / {answered}
          </span>
        </div>
      )}

      {questions.map((q, qIndex) => {
        const selected = states[qIndex].selected;
        const isAnswered = selected !== null;

        return (
          <div
            key={qIndex}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
          >
            {/* Question */}
            <p className="text-sm font-medium text-neutral-200 leading-relaxed">
              <span className="text-primary font-bold mr-2">Q{qIndex + 1}.</span>
              {q.question}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((option, oIndex) => {
                const isCorrect = option === q.answer;
                const isSelected = option === selected;

                let btnClass =
                  "w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ";

                if (!isAnswered) {
                  btnClass +=
                    "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:border-white/20 cursor-pointer";
                } else if (isCorrect) {
                  // Always highlight correct answer green
                  btnClass +=
                    "bg-green-500/20 border-green-500/50 text-green-300 cursor-default";
                } else if (isSelected && !isCorrect) {
                  // Wrong selection → red
                  btnClass +=
                    "bg-red-500/20 border-red-500/50 text-red-300 cursor-default";
                } else {
                  // Unselected, wrong options after answering → dim
                  btnClass +=
                    "bg-white/5 border-white/10 text-neutral-500 cursor-default opacity-60";
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, option)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    {/* Option label */}
                    <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + oIndex)}
                    </span>

                    <span className="flex-1">{option}</span>

                    {/* Icon feedback */}
                    {isAnswered && isCorrect && (
                      <CheckCircle size={18} className="shrink-0 text-green-400" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle size={18} className="shrink-0 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
