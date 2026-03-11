import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
  AlertTriangle, SkipForward, Send, Loader2, XCircle,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { testsApi, questionsApi, attemptsApi, authApi } from "@/lib/api";
import { adaptTest, adaptQuestion } from "@/lib/interfaces";
import type { MockTest, Question } from "@/lib/interfaces";
import { cn, formatTime } from "@/lib/utils";

type Answer = number | null;
type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked-review";

const QUALIFY_MARKS: Record<string, number> = {
  UR: 40,
  General: 40,
  OBC: 30,
  SC: 25,
  ST: 25,
  EWS: 25,
};

export function TakeTestPage() {
  const { testId } = useParams({ from: "/_layout/take-test/$testId" });
  const navigate = useNavigate();

  const { data: apiTest, isLoading: testLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => testsApi.getById(testId),
  });
  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });

  const test = apiTest ? adaptTest(apiTest) : null;

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions", testId],
    queryFn: () => questionsApi.list({ limit: Math.min(test?.totalQuestions ?? 10, 50) }),
    enabled: !!test,
  });

  const rawQuestions = Array.isArray(questionsData)
    ? questionsData
    : (questionsData as { questions?: unknown[] } | undefined)?.questions ?? [];
  const questions = (rawQuestions as Parameters<typeof adaptQuestion>[0][]).map(adaptQuestion);

  const submitMutation = useMutation({
    mutationFn: (data: Parameters<typeof attemptsApi.submit>[1]) =>
      attemptsApi.submit(testId, data),
  });

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [statuses, setStatuses] = useState<QuestionStatus[]>([]);

  // Initialize state when test and questions load
  useEffect(() => {
    if (test && questions.length > 0 && answers.length === 0) {
      setAnswers(Array(questions.length).fill(null));
      setFlagged(Array(questions.length).fill(false));
      setStatuses(Array(questions.length).fill("not-visited") as QuestionStatus[]);
      setTimeLeft(test.duration * 60);
    }
  }, [test, questions.length, answers.length]);

  // Mark current question as visited
  useEffect(() => {
    if (statuses.length === 0) return;
    setStatuses(prev => {
      if (prev[current] === "not-visited") {
        const next = [...prev];
        next[current] = "not-answered";
        return next;
      }
      return prev;
    });
  }, [current, statuses.length]);

  // Prevent page refresh / tab close during exam
  useEffect(() => {
    if (submitted || answers.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submitted, answers.length]);

  const handleSubmit = useCallback(async () => {
    if (!test || questions.length === 0) return;
    setSubmitted(true);
    setShowConfirm(false);

    const optionKeys = ["A", "B", "C", "D", "E"];
    const submitAnswers = questions.map((q, i) => ({
      questionId: q.id,
      selectedOption: answers[i] !== null ? (optionKeys[answers[i]!] ?? "A") : "",
      timeTaken: 30,
      isFlagged: flagged[i] ?? false,
    })).filter(a => a.selectedOption !== "");

    const totalTime = test.duration * 60 - timeLeft;
    await submitMutation.mutateAsync({ timeTaken: totalTime, answers: submitAnswers }).catch(() => {});
  }, [test, questions, answers, flagged, timeLeft, submitMutation]);

  // Timer countdown + auto-submit
  useEffect(() => {
    if (submitted || answers.length === 0) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [submitted, answers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAnswer = (idx: number) => {
    if (submitted) return;
    setAnswers(prev => {
      const next = [...prev];
      next[current] = prev[current] === idx ? null : idx;
      return next;
    });
    setStatuses(prev => {
      const next = [...prev];
      // If deselecting, go back to not-answered; else answered
      next[current] = answers[current] === idx ? "not-answered" : "answered";
      return next;
    });
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = [...prev];
      next[current] = !prev[current];
      return next;
    });
    setStatuses(prev => {
      const next = [...prev];
      if (next[current] !== "marked-review") {
        next[current] = "marked-review";
      } else {
        next[current] = answers[current] !== null ? "answered" : "not-answered";
      }
      return next;
    });
  };

  if (testLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Test not found</p>
          <button onClick={() => navigate({ to: "/mock-tests" })} className="mt-3 text-orange-500 text-sm hover:underline">
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const userCategory = apiUser?.category ?? "UR";
    return (
      <ResultView
        test={test}
        questions={questions}
        answers={answers}
        totalTime={test.duration * 60 - timeLeft}
        userCategory={userCategory}
        navigate={navigate}
      />
    );
  }

  const q = questions[current];
  const answered = answers.filter(a => a !== null).length;
  const isUrgent = timeLeft > 0 && timeLeft < 300;

  const statusColor = (i: number) => {
    if (i === current) return "bg-orange-500 text-white";
    const s = statuses[i];
    if (s === "answered")      return "bg-green-100 text-green-700 border border-green-300";
    if (s === "marked-review") return "bg-purple-100 text-purple-700 border border-purple-300";
    if (s === "not-answered")  return "bg-yellow-50 text-yellow-700 border border-yellow-300";
    return "bg-gray-100 text-gray-500 hover:bg-gray-200";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-gray-800 text-sm truncate max-w-xs">{test.title}</div>
          <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-lg font-medium">{test.exam}</span>
          {test.negativeMarking && (
            <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-lg font-medium">
              -{test.negativeMarkValue ?? 0.25} negative
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">{answered} answered</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{questions.length - answered} remaining</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 font-mono font-bold text-lg px-3 py-1 rounded-xl",
            isUrgent ? "bg-red-50 text-red-600 animate-pulse" : "bg-orange-50 text-orange-600"
          )}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {q?.subject} · {q?.topic}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-700">Q{current + 1} of {questions.length}</span>
                  <span className="text-xs text-gray-400">· +1 mark{test.negativeMarking ? ` / -${test.negativeMarkValue ?? 0.25} wrong` : ""}</span>
                  {flagged[current] && <Flag size={14} className="text-purple-500 fill-purple-200" />}
                </div>
              </div>
              <button
                onClick={toggleFlag}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition",
                  flagged[current]
                    ? "bg-purple-50 border-purple-300 text-purple-600"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-300"
                )}
              >
                <Flag size={12} /> {flagged[current] ? "Marked" : "Mark for Review"}
              </button>
            </div>
            <p className="text-gray-900 font-medium text-base leading-relaxed">{q?.questionText}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q?.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                  answers[current] === i
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 shadow-sm"
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  answers[current] === i
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-300 text-gray-500"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={cn("text-sm leading-relaxed", answers[current] === i ? "text-orange-800 font-medium" : "text-gray-700")}>
                  {opt}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrent(p => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => {
                const next = questions.findIndex((_, i) => i > current && answers[i] === null);
                setCurrent(next !== -1 ? next : Math.min(questions.length - 1, current + 1));
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <SkipForward size={16} /> Skip
            </button>
            <button
              onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
              disabled={current === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="w-60 bg-white border-l border-gray-100 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn("w-8 h-8 text-xs rounded-lg font-medium transition-colors", statusColor(i))}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 text-xs mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" /><span className="text-gray-500">Current</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /><span className="text-gray-500">Answered</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-100 border border-purple-300" /><span className="text-gray-500">Marked for Review</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-300" /><span className="text-gray-500">Not Answered</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100" /><span className="text-gray-500">Not Visited</span></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Answered</span><span className="font-semibold text-green-600">{statuses.filter(s => s === "answered").length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Not Answered</span><span className="font-semibold text-yellow-600">{statuses.filter(s => s === "not-answered").length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Marked Review</span><span className="font-semibold text-purple-600">{statuses.filter(s => s === "marked-review").length}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Not Visited</span><span className="font-semibold text-gray-500">{statuses.filter(s => s === "not-visited").length}</span></div>
          </div>
        </div>
      </div>

      {/* Submit Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Submit Test?</h3>
                <p className="text-gray-500 text-xs">{questions.length - answered} questions unanswered</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-xl p-3 mb-5 text-center text-xs">
              <div><div className="font-bold text-green-600 text-base">{statuses.filter(s => s === "answered").length}</div><div className="text-gray-500">Answered</div></div>
              <div><div className="font-bold text-yellow-600 text-base">{statuses.filter(s => s === "not-answered").length}</div><div className="text-gray-500">Not Ans.</div></div>
              <div><div className="font-bold text-purple-600 text-base">{statuses.filter(s => s === "marked-review").length}</div><div className="text-gray-500">Review</div></div>
              <div><div className="font-bold text-gray-500 text-base">{statuses.filter(s => s === "not-visited").length}</div><div className="text-gray-500">Unvisited</div></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Review
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultView({ test, questions, answers, totalTime, userCategory, navigate }: {
  test: MockTest;
  questions: Question[];
  answers: Answer[];
  totalTime: number;
  userCategory: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const correct = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
  const wrong = answers.filter((a, i) => a !== null && a !== questions[i]?.correctAnswer).length;
  const skipped = answers.filter(a => a === null).length;
  const negMark = test.negativeMarking ? (test.negativeMarkValue ?? 0.25) : 0;
  const score = correct * 1 - wrong * negMark;
  const percentage = Math.max(0, Math.round((score / questions.length) * 100));

  const qualifyingPct = QUALIFY_MARKS[userCategory] ?? 40;
  const qualified = percentage >= qualifyingPct;

  const grade = percentage >= 80 ? { label: "Excellent!", color: "text-green-600", bg: "bg-green-50" }
    : percentage >= 60 ? { label: "Good Job!", color: "text-orange-500", bg: "bg-orange-50" }
    : percentage >= 40 ? { label: "Keep Going!", color: "text-yellow-600", bg: "bg-yellow-50" }
    : { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Test Completed!</h2>
          <div className={cn("text-5xl font-extrabold my-3", grade.color)}>{percentage}%</div>
          <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-2", grade.bg, grade.color)}>
            {grade.label}
          </div>

          {/* Qualification Status */}
          <div className={cn(
            "flex items-center justify-center gap-2 mx-auto mt-3 mb-5 px-5 py-2.5 rounded-xl text-sm font-bold w-fit",
            qualified ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {qualified ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {qualified ? "Qualified" : "Not Qualified"} · {userCategory} cutoff: {qualifyingPct}%
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Score",   value: `${score.toFixed(1)}/${questions.length}`, color: "text-orange-500" },
              { label: "Correct", value: correct,  color: "text-green-600" },
              { label: "Wrong",   value: wrong,    color: "text-red-500" },
              { label: "Skipped", value: skipped,  color: "text-gray-400" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Marking info */}
          <div className="mt-4 bg-orange-50 rounded-xl p-3 text-xs text-orange-700 flex items-center justify-center gap-4">
            <span>+1 per correct</span>
            {negMark > 0 && <span>-{negMark} per wrong</span>}
            <span>0 for skipped</span>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Time taken: {formatTime(totalTime)} · Accuracy: {Math.round((correct / (correct + wrong || 1)) * 100)}%
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Answer Review</h3>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q?.correctAnswer;
              const isWrong = answers[i] !== null && !isCorrect;
              return (
                <div key={i} className={cn(
                  "rounded-xl border p-4",
                  isCorrect ? "bg-green-50 border-green-200" :
                  isWrong ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                )}>
                  <p className="text-sm font-medium text-gray-800 mb-2">{i + 1}. {q?.questionText}</p>
                  <div className="text-xs space-y-1">
                    <div className="text-green-700 font-medium">✓ Correct: {q?.options[q?.correctAnswer]}</div>
                    {isWrong && answers[i] !== null && (
                      <div className="text-red-600">✗ Your answer: {q?.options[answers[i]!]}</div>
                    )}
                    {answers[i] === null && <div className="text-gray-400">— Skipped</div>}
                    {q?.explanation && (
                      <div className="text-gray-500 mt-2 bg-white/70 rounded-lg p-2">{q.explanation}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate({ to: "/mock-tests" })}
            className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            All Tests
          </button>
          <button
            onClick={() => navigate({ to: "/analytics" })}
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
