import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Loader2, SkipForward, BarChart2 } from "lucide-react";
import { analyticsApi, questionsApi } from "@/lib/api";
import { adaptQuestion } from "@/lib/interfaces";
import type { Question } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type DrillState = "idle" | "drilling" | "done";

export function WeaknessDrillPage() {
  const [drillState, setDrillState] = useState<DrillState>("idle");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsApi.getMy,
    retry: false,
  });

  // Find weak topics (< 60% accuracy)
  const weakTopics: string[] = analytics?.topicWise
    ?.filter(t => Math.round((t.correct / t.total) * 100) < 60)
    .map(t => t.topic) ?? analytics?.weakTopics ?? [];

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["drill-questions"],
    queryFn: () => questionsApi.list({ limit: 20 }),
    enabled: drillState === "drilling",
  });

  const rawQuestions = Array.isArray(questionsData)
    ? questionsData
    : (questionsData as { questions?: unknown[] } | undefined)?.questions ?? [];
  const questions: Question[] = (rawQuestions as Parameters<typeof adaptQuestion>[0][]).map(adaptQuestion);

  useEffect(() => {
    if (drillState === "drilling" && questions.length > 0 && answers.length === 0) {
      setAnswers(Array(questions.length).fill(null));
    }
  }, [drillState, questions.length, answers.length]);

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setAnswers(prev => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
  };

  const handleReveal = () => setRevealed(true);

  const handleNext = useCallback(() => {
    const q = questions[current];
    const isCorrect = answers[current] === q?.correctAnswer;
    setResults(prev => [...prev, isCorrect]);
    setRevealed(false);
    if (current + 1 >= questions.length) {
      setDrillState("done");
    } else {
      setCurrent(p => p + 1);
    }
  }, [answers, current, questions]);

  const handleSkip = () => {
    setResults(prev => [...prev, false]);
    setRevealed(false);
    if (current + 1 >= questions.length) {
      setDrillState("done");
    } else {
      setCurrent(p => p + 1);
    }
  };

  const startDrill = () => {
    setDrillState("drilling");
    setCurrent(0);
    setAnswers([]);
    setResults([]);
    setRevealed(false);
  };

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (drillState === "done") {
    const correct = results.filter(Boolean).length;
    const pct = Math.round((correct / results.length) * 100);
    return (
      <div className="p-5 max-w-2xl mx-auto space-y-5">
        <Header />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Drill Complete!</h2>
          <div className={cn(
            "text-5xl font-extrabold my-4",
            pct >= 80 ? "text-green-600" : pct >= 60 ? "text-blue-600" : "text-yellow-600"
          )}>{pct}%</div>
          <p className="text-gray-500 text-sm mb-6">{correct}/{results.length} correct</p>
          <div className="flex gap-3">
            <button
              onClick={startDrill}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Drill Again
            </button>
            <Link
              to="/analytics"
              className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (drillState === "idle") {
    return (
      <div className="p-5 max-w-2xl mx-auto space-y-5">
        <Header />

        {/* Weak topics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Target size={16} className="text-red-500" /> Your Weak Topics
          </h2>
          {weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-5">
              {weakTopics.map(topic => (
                <span key={topic} className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full font-medium border border-red-200">
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-5">
              No weak topics detected yet. Take more tests to identify areas to improve.
            </p>
          )}

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-5">
            <strong>Untimed mode</strong> — Focus on learning, not speed. Each question shows the explanation after you answer.
          </div>

          <button
            onClick={startDrill}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Target size={18} /> Start Drill
          </button>
        </div>

        {weakTopics.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center text-gray-400">
            <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Take more mock tests to unlock personalised weak-topic drilling.</p>
            <Link to="/mock-tests" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
              Browse Tests
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Drilling state
  if (questionsLoading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const q = questions[current];
  const selectedAnswer = answers[current];
  const isCorrect = selectedAnswer === q?.correctAnswer;

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      <Header />

      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 shrink-0">{current + 1}/{questions.length}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-green-600 font-medium shrink-0">{results.filter(Boolean).length} correct</span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="text-xs text-gray-400 font-medium mb-2">{q?.subject} · {q?.topic}</div>
        <p className="text-sm font-medium text-gray-800 leading-relaxed mb-4">{q?.questionText}</p>

        <div className="space-y-2">
          {q?.options.map((opt, i) => {
            let cls = "border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200";
            if (revealed) {
              if (i === q.correctAnswer) cls = "border-green-500 bg-green-50 text-green-800";
              else if (i === selectedAnswer) cls = "border-red-400 bg-red-50 text-red-700";
              else cls = "border-gray-100 bg-gray-50 text-gray-400";
            } else if (selectedAnswer === i) {
              cls = "border-blue-500 bg-blue-50 text-blue-800 font-medium";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
                className={cn("w-full text-left text-sm px-4 py-2.5 rounded-lg border-2 transition-all flex items-center gap-3", cls)}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                  revealed && i === q.correctAnswer ? "border-green-500 bg-green-500 text-white" :
                  revealed && i === selectedAnswer ? "border-red-400 bg-red-400 text-white" :
                  selectedAnswer === i ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-gray-500"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className="mt-4 space-y-2">
            <div className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              isCorrect ? "text-green-600" : "text-red-600"
            )}>
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? "Correct!" : "Incorrect"}
            </div>
            {q?.explanation && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 leading-relaxed">
                {q.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {current > 0 && !revealed && (
          <button
            onClick={() => { setCurrent(p => p - 1); setRevealed(false); }}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {!revealed && selectedAnswer !== null && (
          <button
            onClick={handleReveal}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Check Answer
          </button>
        )}

        {!revealed && selectedAnswer === null && (
          <button
            onClick={handleSkip}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            <SkipForward size={16} /> Skip
          </button>
        )}

        {revealed && (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            {current + 1 >= questions.length ? "Finish" : "Next"}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Target size={20} className="text-red-500" /> Weakness Drill
      </h1>
      <p className="text-gray-500 text-sm mt-0.5">Untimed practice on your weak topics</p>
    </div>
  );
}
