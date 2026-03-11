import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle,
  AlertTriangle, Send, Loader2, BookOpen, Play, RotateCcw,
  Target, Trophy, SkipForward, Train,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { questionsApi, authApi } from "@/lib/api";
import { adaptQuestion } from "@/lib/interfaces";
import type { Question } from "@/lib/interfaces";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const EXAMS = ["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"];
const SUBJECTS = ["All Subjects", "Mathematics", "Reasoning", "General Knowledge", "Technical"];
const DIFFICULTIES = ["All", "easy", "medium", "hard"] as const;
const QUESTION_COUNTS = [10, 25, 50, 100];
const DURATIONS: Record<number, number> = { 10: 10, 25: 25, 50: 45, 100: 90 };

const QUALIFY_MARKS: Record<string, number> = {
  UR: 40, General: 40, OBC: 30, SC: 25, ST: 25, EWS: 25,
};

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked-review";
type Phase = "lobby" | "exam" | "result";

interface ExamConfig {
  exam: string;
  subject: string;
  difficulty: typeof DIFFICULTIES[number];
  count: number;
}

// ─── Lobby Screen ─────────────────────────────────────────────────────────────

function LobbyScreen({ onStart, userCategory }: { onStart: (cfg: ExamConfig) => void; userCategory: string }) {
  const [cfg, setCfg] = useState<ExamConfig>({
    exam: "RRB NTPC", subject: "All Subjects", difficulty: "All", count: 25,
  });

  const durationMins = DURATIONS[cfg.count];
  const qualifyPct = QUALIFY_MARKS[userCategory] ?? 40;

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="p-6 text-white text-center"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
            <Train size={28} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">RailwayPrep Exam</h1>
          <p className="text-slate-400 text-sm mt-1">Configure and start your real-time practice</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Target Exam */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Target Exam</label>
            <div className="grid grid-cols-2 gap-2">
              {EXAMS.map(e => (
                <button
                  key={e}
                  onClick={() => setCfg(p => ({ ...p, exam: e }))}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition",
                    cfg.exam === e
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Subject</label>
            <select
              value={cfg.subject}
              onChange={e => setCfg(p => ({ ...p, subject: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 bg-white text-gray-700"
            >
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setCfg(p => ({ ...p, difficulty: d }))}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border-2 transition capitalize",
                    cfg.difficulty === d
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 text-gray-400 hover:border-orange-300"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Questions</label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map(n => (
                <button
                  key={n}
                  onClick={() => setCfg(p => ({ ...p, count: n }))}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-bold border-2 transition",
                    cfg.count === n
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 text-gray-400 hover:border-orange-300"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <div className="font-extrabold text-amber-700 text-xl">{cfg.count}</div>
              <div className="text-amber-600 mt-0.5">Questions</div>
            </div>
            <div>
              <div className="font-extrabold text-amber-700 text-xl">{durationMins}m</div>
              <div className="text-amber-600 mt-0.5">Duration</div>
            </div>
            <div>
              <div className="font-extrabold text-amber-700 text-xl">{qualifyPct}%</div>
              <div className="text-amber-600 mt-0.5">{userCategory} cutoff</div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-600 space-y-1.5">
            <div className="font-bold text-stone-700 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Exam Rules
            </div>
            <div>✅ +1 mark for correct answer</div>
            <div>❌ -0.25 for wrong · 0 for skipped</div>
            <div>⏱ Auto-submits when timer ends</div>
            <div>🚫 Do not refresh — progress will be lost</div>
          </div>

          <button
            onClick={() => onStart(cfg)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={18} /> Board the Exam
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Exam Page ───────────────────────────────────────────────────────────

export function ExamPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [cfg, setCfg] = useState<ExamConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [statuses, setStatuses] = useState<QuestionStatus[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultData, setResultData] = useState<{ questions: Question[]; answers: (number | null)[]; timeTaken: number } | null>(null);
  const startTimeRef = useRef<number>(0);

  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const userCategory = apiUser?.category ?? "UR";

  const [fetchTrigger, setFetchTrigger] = useState(false);
  const { data: rawQData, isLoading: questionsLoading } = useQuery({
    queryKey: ["exam-live", cfg?.subject, cfg?.difficulty, cfg?.count, fetchTrigger],
    queryFn: () => {
      if (!cfg) throw new Error("No config");
      const params: Parameters<typeof questionsApi.list>[0] = { limit: cfg.count };
      if (cfg.subject !== "All Subjects") params.subject = cfg.subject;
      if (cfg.difficulty !== "All") params.difficulty = cfg.difficulty;
      return questionsApi.list(params);
    },
    enabled: !!cfg && fetchTrigger,
    retry: false,
  });

  useEffect(() => {
    if (!rawQData || phase !== "lobby") return;
    const raw = Array.isArray(rawQData)
      ? rawQData
      : (rawQData as { questions?: unknown[] }).questions ?? [];
    const adapted = (raw as Parameters<typeof adaptQuestion>[0][]).map(adaptQuestion);
    if (adapted.length === 0) {
      toast.error("No questions found. Try different filters.");
      setCfg(null);
      setFetchTrigger(false);
      return;
    }
    const count = Math.min(adapted.length, cfg!.count);
    const selected = adapted.slice(0, count);
    setQuestions(selected);
    setAnswers(Array(count).fill(null));
    setStatuses(Array(count).fill("not-visited") as QuestionStatus[]);
    setFlagged(Array(count).fill(false));
    setTimeLeft(DURATIONS[cfg!.count] * 60);
    startTimeRef.current = Date.now();
    setPhase("exam");
  }, [rawQData]);

  // Mark current as visited
  useEffect(() => {
    if (phase !== "exam" || statuses.length === 0) return;
    setStatuses(prev => {
      if (prev[current] === "not-visited") {
        const next = [...prev];
        next[current] = "not-answered";
        return next;
      }
      return prev;
    });
  }, [current, phase]);

  // Prevent refresh during exam
  useEffect(() => {
    if (phase !== "exam") return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const submitExam = useCallback((isAutoSubmit = false) => {
    if (phase !== "exam") return;
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    setResultData({ questions, answers, timeTaken });
    setPhase("result");
    setShowConfirm(false);
    if (isAutoSubmit) toast.info("Time's up! Exam submitted.");
  }, [phase, questions, answers]);

  // Timer
  useEffect(() => {
    if (phase !== "exam" || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); submitExam(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAnswer = (idx: number) => {
    setAnswers(prev => { const n = [...prev]; n[current] = prev[current] === idx ? null : idx; return n; });
    setStatuses(prev => {
      const n = [...prev];
      n[current] = answers[current] === idx ? "not-answered" : "answered";
      return n;
    });
  };

  const toggleFlag = () => {
    const nowFlagged = !flagged[current];
    setFlagged(prev => { const n = [...prev]; n[current] = nowFlagged; return n; });
    setStatuses(prev => {
      const n = [...prev];
      n[current] = nowFlagged ? "marked-review" : (answers[current] !== null ? "answered" : "not-answered");
      return n;
    });
  };

  // ── Lobby ──
  if (phase === "lobby") {
    if (questionsLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Loader2 size={32} className="animate-spin text-amber-300" />
            </div>
            <p className="font-bold text-lg">Loading questions...</p>
            <p className="text-slate-400 text-sm mt-1">Fetching real exam questions from server</p>
          </div>
        </div>
      );
    }
    return <LobbyScreen onStart={(config) => { setCfg(config); setFetchTrigger(true); }} userCategory={userCategory} />;
  }

  // ── Result ──
  if (phase === "result" && resultData) {
    return (
      <ResultScreen
        questions={resultData.questions}
        answers={resultData.answers}
        timeTaken={resultData.timeTaken}
        cfg={cfg!}
        userCategory={userCategory}
        onRetry={() => { setPhase("lobby"); setCfg(null); setFetchTrigger(false); setCurrent(0); }}
        navigate={navigate}
      />
    );
  }

  // ── Exam ──
  if (phase !== "exam" || questions.length === 0) return null;

  const q = questions[current];
  const answered = answers.filter(a => a !== null).length;
  const isUrgent = timeLeft > 0 && timeLeft < 300;

  const statusColor = (i: number) => {
    if (i === current) return "bg-orange-500 text-white shadow-md";
    const s = statuses[i];
    if (s === "answered")      return "bg-green-100 text-green-700 border border-green-300";
    if (s === "marked-review") return "bg-amber-100 text-amber-700 border border-amber-300";
    if (s === "not-answered")  return "bg-orange-50 text-orange-600 border border-orange-200";
    return "bg-gray-100 text-gray-400 hover:bg-gray-200";
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Train size={16} className="text-orange-500" />
            <span className="font-bold text-gray-800 text-sm">{cfg!.exam}</span>
          </div>
          <span className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-lg font-semibold capitalize border border-orange-200">
            {cfg!.difficulty}
          </span>
          <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-lg font-semibold border border-amber-200">
            −0.25 negative
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm hidden sm:block text-stone-500">
            <span className="text-green-600 font-bold">{answered}</span>/{questions.length} answered
          </div>
          <div className={cn(
            "flex items-center gap-1.5 font-mono font-bold text-base px-3 py-1.5 rounded-xl border",
            isUrgent
              ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}>
            <Clock size={15} />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-lg transition bg-orange-500 hover:bg-orange-600"
          >
            <Send size={13} /> Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-stone-400 font-semibold uppercase tracking-wide">
                  {q.subject} · {q.topic}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-extrabold text-gray-800">Q{current + 1}</span>
                  <span className="text-xs text-stone-400">of {questions.length}</span>
                  <span className="text-xs text-orange-500 font-bold">+1 / −0.25</span>
                </div>
              </div>
              <button
                onClick={toggleFlag}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border-2 transition font-semibold",
                  flagged[current]
                    ? "bg-amber-50 border-amber-400 text-amber-700"
                    : "border-stone-200 text-stone-400 hover:border-amber-400 hover:text-amber-600"
                )}
              >
                <Flag size={12} />
                {flagged[current] ? "Marked" : "Mark"}
              </button>
            </div>
            <p className="text-gray-900 font-medium text-base leading-relaxed">{q.questionText}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                  answers[current] === i
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-stone-100 bg-white hover:border-orange-300 hover:bg-orange-50/30 shadow-sm"
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0",
                  answers[current] === i
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-stone-300 text-stone-500"
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={cn(
                  "text-sm leading-relaxed",
                  answers[current] === i ? "text-orange-700 font-semibold" : "text-gray-700"
                )}>
                  {opt}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => setCurrent(p => Math.max(0, p - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-xl text-sm text-gray-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => {
                const next = questions.findIndex((_, i) => i > current && answers[i] === null);
                setCurrent(next !== -1 ? next : Math.min(questions.length - 1, current + 1));
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 rounded-xl text-sm text-stone-600 hover:bg-stone-200 transition"
            >
              <SkipForward size={15} /> Skip
            </button>
            <button
              onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
              disabled={current === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition bg-orange-500 hover:bg-orange-600"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Navigator Sidebar */}
        <div className="w-56 bg-white border-l border-stone-100 p-4 overflow-y-auto flex-shrink-0">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Train size={12} className="text-orange-500" /> Navigator
          </div>
          <div className="grid grid-cols-5 gap-1 mb-4">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn("w-8 h-8 text-[11px] rounded-lg font-bold transition-all", statusColor(i))}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-[11px] mb-4">
            {[
              { color: "bg-orange-500",                             label: "Current" },
              { color: "bg-green-100 border border-green-300",      label: "Answered" },
              { color: "bg-amber-100 border border-amber-300",      label: "Marked Review" },
              { color: "bg-orange-50 border border-orange-200",     label: "Not Answered" },
              { color: "bg-gray-100",                               label: "Not Visited" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded flex-shrink-0", color)} />
                <span className="text-stone-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-xs border border-stone-100">
            {[
              { label: "Answered",    value: statuses.filter(s => s === "answered").length,      color: "text-green-600" },
              { label: "Not Ans.",    value: statuses.filter(s => s === "not-answered").length,  color: "text-orange-500" },
              { label: "For Review",  value: statuses.filter(s => s === "marked-review").length, color: "text-amber-600" },
              { label: "Not Visited", value: statuses.filter(s => s === "not-visited").length,   color: "text-gray-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span className="text-stone-500">{label}</span>
                <span className={cn("font-bold", color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Submit Exam?</h3>
                <p className="text-stone-500 text-xs mt-0.5">
                  {statuses.filter(s => s === "not-visited" || s === "not-answered").length} questions unattempted
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-stone-50 rounded-xl p-3 mb-4 text-center text-xs border border-stone-100">
              <div>
                <div className="font-bold text-green-600 text-lg">{statuses.filter(s => s === "answered").length}</div>
                <div className="text-stone-400">Answered</div>
              </div>
              <div>
                <div className="font-bold text-orange-500 text-lg">{statuses.filter(s => s === "not-answered").length}</div>
                <div className="text-stone-400">Not Ans.</div>
              </div>
              <div>
                <div className="font-bold text-amber-600 text-lg">{statuses.filter(s => s === "marked-review").length}</div>
                <div className="text-stone-400">Review</div>
              </div>
              <div>
                <div className="font-bold text-stone-400 text-lg">{statuses.filter(s => s === "not-visited").length}</div>
                <div className="text-stone-400">Unvisited</div>
              </div>
            </div>
            <p className="text-xs text-stone-500 mb-4 text-center">
              Time remaining: <span className="font-bold text-amber-600">{formatTime(timeLeft)}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-stone-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-50 transition text-gray-600"
              >
                Continue
              </button>
              <button
                onClick={() => submitExam(false)}
                className="flex-1 text-white py-2.5 rounded-xl text-sm font-bold transition bg-orange-500 hover:bg-orange-600"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({ questions, answers, timeTaken, cfg, userCategory, onRetry, navigate }: {
  questions: Question[];
  answers: (number | null)[];
  timeTaken: number;
  cfg: ExamConfig;
  userCategory: string;
  onRetry: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const correct    = answers.filter((a, i) => a !== null && a === questions[i]?.correctAnswer).length;
  const wrong      = answers.filter((a, i) => a !== null && a !== questions[i]?.correctAnswer).length;
  const skipped    = answers.filter(a => a === null).length;
  const score      = correct * 1 - wrong * 0.25;
  const percentage = Math.max(0, Math.round((score / questions.length) * 100));
  const qualifyingPct = QUALIFY_MARKS[userCategory] ?? 40;
  const qualified  = percentage >= qualifyingPct;
  const accuracy   = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  const grade =
    percentage >= 80 ? { label: "Excellent!", color: "text-green-700",    bg: "bg-green-50",    border: "border-green-300"  } :
    percentage >= 60 ? { label: "Good Job!",  color: "text-orange-500",   bg: "bg-orange-50",   border: "border-orange-200" } :
    percentage >= 40 ? { label: "Keep Going!",color: "text-amber-700",    bg: "bg-amber-50",    border: "border-amber-300"  } :
                       { label: "Needs Work", color: "text-stone-600",    bg: "bg-stone-50",    border: "border-stone-300"  };

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Score Hero */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Top strip */}
          <div className="h-2" style={{ background: "linear-gradient(90deg, #f97316, #fb923c, #fdba74, #fb923c, #f97316)" }} />
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Train size={18} className="text-orange-500" />
              <span className="font-bold text-stone-600 text-sm">{cfg.exam} · {cfg.subject} · {cfg.difficulty}</span>
            </div>

            <div className={cn("text-6xl font-extrabold mb-2", grade.color)}>{percentage}%</div>
            <div className={cn("inline-block px-5 py-1.5 rounded-full text-sm font-bold mb-4 border", grade.bg, grade.color, grade.border)}>
              {grade.label}
            </div>

            {/* Qualification */}
            <div className={cn(
              "flex items-center justify-center gap-2 w-fit mx-auto px-5 py-2.5 rounded-xl border-2 font-bold text-sm mb-5",
              qualified ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-300 text-red-600"
            )}>
              {qualified ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {qualified ? "Qualified ✓" : "Not Qualified"}
              <span className="font-normal opacity-60 text-xs">· {userCategory} cutoff: {qualifyingPct}%</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Score",   value: `${score.toFixed(2)}/${questions.length}`, color: "text-orange-500" },
                { label: "Correct", value: correct,  color: "text-green-600" },
                { label: "Wrong",   value: wrong,    color: "text-red-500"   },
                { label: "Skipped", value: skipped,  color: "text-stone-400" },
              ].map(s => (
                <div key={s.label} className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <div className={cn("text-xl font-extrabold", s.color)}>{s.value}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Marking breakdown */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-center gap-5 mb-3">
              <span>✅ +1 × {correct} = <b>+{correct}</b></span>
              <span>❌ −0.25 × {wrong} = <b>−{(wrong * 0.25).toFixed(2)}</b></span>
              <span>📊 Final: <b>{score.toFixed(2)}</b></span>
            </div>

            <div className="text-sm text-stone-400">
              Time: {formatTime(timeTaken)} · Accuracy: {accuracy}%
            </div>
          </div>
        </div>

        {/* Qualification Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <Target size={15} className="text-orange-500" /> Category Qualifying Marks
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {Object.entries(QUALIFY_MARKS).filter(([k]) => k !== "General").map(([cat, pct]) => (
              <div key={cat} className={cn(
                "rounded-xl p-2.5 border-2",
                cat === userCategory ? "border-orange-500 bg-orange-50" : "border-stone-100 bg-stone-50"
              )}>
                <div className={cn("font-extrabold text-base", percentage >= pct ? "text-green-600" : "text-red-500")}>{pct}%</div>
                <div className="text-stone-500 mt-0.5">{cat}</div>
                {cat === userCategory && <div className="text-[9px] text-orange-500 font-bold mt-1">YOU</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <BookOpen size={15} className="text-orange-500" /> Answer Review
          </h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isCorrect = answers[i] !== null && answers[i] === q.correctAnswer;
              const isWrong   = answers[i] !== null && !isCorrect;
              return (
                <div key={i} className={cn(
                  "rounded-xl border p-4",
                  isCorrect ? "bg-green-50 border-green-200" :
                  isWrong   ? "bg-red-50 border-red-200"     : "bg-stone-50 border-stone-200"
                )}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-bold text-stone-400 flex-shrink-0 mt-0.5">Q{i + 1}</span>
                    <p className="text-sm font-medium text-gray-800 flex-1">{q.questionText}</p>
                    <span className={cn(
                      "flex-shrink-0 text-xs font-bold",
                      isCorrect ? "text-green-600" : isWrong ? "text-red-600" : "text-stone-400"
                    )}>
                      {isCorrect ? "+1" : isWrong ? "−0.25" : "0"}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5 ml-5">
                    <div className="text-green-700 font-semibold">✓ {q.options[q.correctAnswer]}</div>
                    {isWrong && <div className="text-red-600">✗ {q.options[answers[i]!]}</div>}
                    {answers[i] === null && <div className="text-stone-400">— Skipped</div>}
                    {q.explanation && (
                      <div className="text-stone-500 mt-1.5 bg-white/80 rounded-lg p-2 leading-relaxed border border-stone-100">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-stone-300 text-stone-600 py-3 rounded-xl text-sm font-bold hover:bg-stone-100 transition"
          >
            <RotateCcw size={15} /> New Exam
          </button>
          <button
            onClick={() => navigate({ to: "/analytics" })}
            className="flex-1 text-white py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <Trophy size={15} /> View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
