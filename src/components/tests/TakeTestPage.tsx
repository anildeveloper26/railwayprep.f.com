import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
  AlertTriangle, SkipForward, Send, Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn, formatTime } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionKey = "A" | "B" | "C" | "D";

interface ApiOption { key: OptionKey; text: string }

interface ApiQuestion {
  _id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionText: string;
  options: ApiOption[];
  correctOption?: OptionKey;   // only present in /review response
  explanation?: string;         // only present in /review response
}

interface ApiTest {
  _id: string;
  title: string;
  exam: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  sections: { subject: string; negativeMarks: number }[];
  questions: ApiQuestion[];
}

interface SubmittedAttempt {
  _id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTaken: number;
  answers: { questionId: string; selectedOption: OptionKey | null; isCorrect: boolean; marksAwarded: number }[];
}

// ─── TakeTestPage ─────────────────────────────────────────────────────────────

export function TakeTestPage() {
  const { testId } = useParams({ from: "/_layout/take-test/$testId" });
  const navigate = useNavigate();

  const { data: testData, isLoading, error } = useQuery({
    queryKey: ["test", testId],
    queryFn: () => api.get<{ test: ApiTest }>(`/tests/${testId}`),
  });

  const test = testData?.data.test;
  const questions = test?.questions ?? [];

  const [current, setCurrent] = useState(0);
  // answerMap: questionId → selected option key
  const [answerMap, setAnswerMap] = useState<Record<string, OptionKey | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attempt, setAttempt] = useState<SubmittedAttempt | null>(null);
  const [reviewTest, setReviewTest] = useState<ApiTest | null>(null);

  // Set timer once test is loaded
  useEffect(() => {
    if (test && timeLeft === null) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, timeLeft]);

  const submitMutation = useMutation({
    mutationFn: async (timeTakenSecs: number) => {
      const answers = questions.map(q => ({
        questionId: q._id,
        selectedOption: answerMap[q._id] ?? null,
        timeTaken: Math.round(timeTakenSecs / questions.length),
        isFlagged: flagged[q._id] ?? false,
      }));
      return api.post<{ attempt: SubmittedAttempt }>(`/attempts/${testId}/submit`, {
        answers,
        timeTaken: timeTakenSecs,
      });
    },
    onSuccess: async (res) => {
      setAttempt(res.data.attempt);
      // Fetch full question data with correct answers for review
      try {
        const reviewRes = await api.get<{ test: ApiTest }>(`/tests/${testId}/review`);
        setReviewTest(reviewRes.data.test);
      } catch {
        // review data optional
      }
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit test");
    },
  });

  const handleSubmit = useCallback(() => {
    if (!test || submitMutation.isPending) return;
    const elapsed = test.duration * 60 - (timeLeft ?? 0);
    setShowConfirm(false);
    submitMutation.mutate(elapsed);
  }, [test, timeLeft, submitMutation]);

  useEffect(() => {
    if (submitted || timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && !submitted) handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(p => (p ?? 1) - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, handleSubmit]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading test...
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Failed to load test. Please go back and try again.
      </div>
    );
  }

  if (submitted && attempt) {
    return (
      <ResultView
        test={reviewTest ?? test}
        attempt={attempt}
        answerMap={answerMap}
        navigate={navigate}
      />
    );
  }

  if (submitMutation.isPending) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> Submitting test...
      </div>
    );
  }

  const q = questions[current];
  const answered = Object.values(answerMap).filter(v => v !== null).length;
  const isUrgent = (timeLeft ?? 999) < 300;

  const selectAnswer = (key: OptionKey) => {
    setAnswerMap(prev => ({
      ...prev,
      [q._id]: prev[q._id] === key ? null : key,
    }));
  };

  const toggleFlag = () => {
    setFlagged(prev => ({ ...prev, [q._id]: !prev[q._id] }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-gray-800 text-sm truncate max-w-xs">{test.title}</div>
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">{test.exam}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">{answered} answered</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">{questions.length - answered} skipped</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 font-mono font-bold text-lg px-3 py-1 rounded-xl",
            isUrgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
          )}>
            <Clock size={16} />
            {formatTime(timeLeft ?? 0)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
                  {flagged[q?._id] && <Flag size={14} className="text-orange-500 fill-orange-200" />}
                </div>
              </div>
              <button
                onClick={toggleFlag}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition",
                  flagged[q?._id]
                    ? "bg-orange-50 border-orange-300 text-orange-600"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-orange-300"
                )}
              >
                <Flag size={12} /> {flagged[q?._id] ? "Flagged" : "Flag"}
              </button>
            </div>
            <p className="text-gray-900 font-medium text-base leading-relaxed">{q?.questionText}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q?.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => selectAnswer(opt.key)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                  answerMap[q._id] === opt.key
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 shadow-sm"
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  answerMap[q._id] === opt.key
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 text-gray-500"
                )}>
                  {opt.key}
                </span>
                <span className={cn("text-sm leading-relaxed", answerMap[q._id] === opt.key ? "text-blue-800 font-medium" : "text-gray-700")}>
                  {opt.text}
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
                const next = questions.findIndex((q2, i) => i > current && !answerMap[q2._id]);
                setCurrent(next !== -1 ? next : Math.min(questions.length - 1, current + 1));
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              <SkipForward size={16} /> Skip
            </button>
            <button
              onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
              disabled={current === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="w-56 bg-white border-l border-gray-100 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q2, i) => (
              <button
                key={q2._id}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-8 h-8 text-xs rounded-lg font-medium transition-colors",
                  i === current ? "bg-blue-600 text-white" :
                  answerMap[q2._id] ? "bg-green-100 text-green-700 border border-green-300" :
                  flagged[q2._id] ? "bg-orange-100 text-orange-600 border border-orange-300" :
                  "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600" /><span className="text-gray-500">Current</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /><span className="text-gray-500">Answered</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-300" /><span className="text-gray-500">Flagged</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100" /><span className="text-gray-500">Not visited</span></div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Answered</span><span className="font-semibold text-green-600">{answered}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Unanswered</span><span className="font-semibold text-red-500">{questions.length - answered}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Flagged</span><span className="font-semibold text-orange-500">{Object.values(flagged).filter(Boolean).length}</span></div>
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
            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3 mb-5 text-center text-xs">
              <div><div className="font-bold text-green-600 text-base">{answered}</div><div className="text-gray-500">Answered</div></div>
              <div><div className="font-bold text-red-500 text-base">{questions.length - answered}</div><div className="text-gray-500">Skipped</div></div>
              <div><div className="font-bold text-orange-500 text-base">{Object.values(flagged).filter(Boolean).length}</div><div className="text-gray-500">Flagged</div></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Review
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ResultView ───���───────────────────────────────────────────────────────────

function ResultView({
  test, attempt, answerMap, navigate,
}: {
  test: ApiTest;
  attempt: SubmittedAttempt;
  answerMap: Record<string, OptionKey | null>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { score, totalMarks, percentage, correctAnswers, wrongAnswers, unanswered, timeTaken } = attempt;

  const grade =
    percentage >= 80 ? { label: "Excellent!", color: "text-green-600", bg: "bg-green-50" } :
    percentage >= 60 ? { label: "Good Job!", color: "text-blue-600", bg: "bg-blue-50" } :
    percentage >= 40 ? { label: "Keep Going!", color: "text-yellow-600", bg: "bg-yellow-50" } :
    { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-50" };

  // Build per-question review map from attempt.answers
  const attemptAnswerMap = new Map(
    attempt.answers.map(a => [a.questionId, a])
  );

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Test Completed!</h2>
          <div className={cn("text-5xl font-extrabold my-3", grade.color)}>{percentage.toFixed(1)}%</div>
          <div className={cn("inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4", grade.bg, grade.color)}>
            {grade.label}
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Score",   value: `${score.toFixed(1)}/${totalMarks}`, color: "text-blue-600" },
              { label: "Correct", value: correctAnswers,                      color: "text-green-600" },
              { label: "Wrong",   value: wrongAnswers,                        color: "text-red-500" },
              { label: "Skipped", value: unanswered,                          color: "text-gray-400" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Time taken: {formatTime(timeTaken)}
          </div>
        </div>

        {/* Answer Review (only if review data available with correctOption) */}
        {test.questions.some(q => q.correctOption) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Answer Review</h3>
            <div className="space-y-4">
              {test.questions.map((q, i) => {
                const myAttempt = attemptAnswerMap.get(q._id);
                const isCorrect = myAttempt?.isCorrect ?? false;
                const selected = myAttempt?.selectedOption ?? answerMap[q._id] ?? null;
                const isWrong = selected !== null && !isCorrect;
                const correctOpt = q.correctOption;
                const correctText = q.options.find(o => o.key === correctOpt)?.text ?? "";
                const selectedText = selected ? q.options.find(o => o.key === selected)?.text ?? "" : null;

                return (
                  <div key={q._id} className={cn(
                    "rounded-xl border p-4",
                    isCorrect ? "bg-green-50 border-green-200" :
                    isWrong   ? "bg-red-50 border-red-200"     : "bg-gray-50 border-gray-200"
                  )}>
                    <p className="text-sm font-medium text-gray-800 mb-2">{i + 1}. {q.questionText}</p>
                    <div className="text-xs space-y-1">
                      <div className="text-green-700 font-medium">✓ Correct: ({correctOpt}) {correctText}</div>
                      {isWrong && selected && (
                        <div className="text-red-600">✗ Your answer: ({selected}) {selectedText}</div>
                      )}
                      {!selected && <div className="text-gray-400">— Skipped</div>}
                      {q.explanation && (
                        <div className="text-gray-500 mt-2 bg-white/70 rounded-lg p-2">{q.explanation}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate({ to: "/mock-tests" })}
            className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            All Tests
          </button>
          <button
            onClick={() => navigate({ to: "/analytics" })}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
