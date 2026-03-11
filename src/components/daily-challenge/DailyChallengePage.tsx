import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Trophy, Clock, CheckCircle2, Loader2, Zap, Star } from "lucide-react";
import { dailyChallengeApi } from "@/lib/api";
import { authApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChallengeQuestion = {
  _id: string;
  questionText: string;
  options: Array<{ key: string; text: string }>;
  subject: string;
  topic: string;
  difficulty: string;
};

export function DailyChallengePage() {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; streak: { currentStreak: number; longestStreak: number } } | null>(null);

  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const user = apiUser ? adaptUser(apiUser) : null;

  const { data, isLoading } = useQuery({
    queryKey: ["daily-challenge"],
    queryFn: () => dailyChallengeApi.get(user?.targetExam),
    enabled: !!apiUser,
  });

  const submitMutation = useMutation({
    mutationFn: dailyChallengeApi.submit,
    onSuccess: (res) => {
      setResult({ score: res.score, total: questions.length, streak: res.streak });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
    },
    onError: () => toast.error("Failed to submit. Please try again."),
  });

  const questions: ChallengeQuestion[] = (data?.alreadyAttempted ? [] : data?.questions ?? []) as ChallengeQuestion[];
  const streak = data?.streak ?? { currentStreak: 0, longestStreak: 0, totalCompleted: 0 };

  function handleSelect(qIdx: number, key: string) {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: key }));
  }

  function handleSubmit() {
    if (!data || data.alreadyAttempted) return;
    const questionIds = questions.map(q => q._id);
    const answerPayload = questions.map((q, i) => ({
      questionId: q._id,
      selectedOption: answers[i] ?? "",
    }));
    submitMutation.mutate({ exam: data.exam, questionIds, answers: answerPayload });
  }

  const answeredCount = Object.keys(answers).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Already attempted today
  if (data?.alreadyAttempted && !result) {
    return (
      <div className="p-5 max-w-2xl mx-auto space-y-5">
        <Header streak={streak} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Already completed today!</h2>
          <p className="text-gray-500 text-sm">Come back tomorrow for a new challenge.</p>
          <div className="mt-5 bg-orange-50 rounded-xl p-4 inline-flex items-center gap-3">
            <Flame size={24} className="text-orange-500" />
            <div className="text-left">
              <div className="text-2xl font-extrabold text-orange-600">{streak.currentStreak}</div>
              <div className="text-xs text-orange-500 font-medium">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result view
  if (submitted && result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="p-5 max-w-2xl mx-auto space-y-5">
        <Header streak={result.streak} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <Trophy size={48} className="text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Challenge Complete!</h2>
          <div className={cn(
            "text-5xl font-extrabold my-4",
            pct >= 80 ? "text-green-600" : pct >= 60 ? "text-blue-600" : pct >= 40 ? "text-yellow-600" : "text-red-600"
          )}>
            {pct}%
          </div>
          <p className="text-gray-500 text-sm mb-5">{result.score} / {result.total} correct</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame size={18} className="text-orange-500" />
                <span className="text-xs font-medium text-orange-600">Current Streak</span>
              </div>
              <div className="text-3xl font-extrabold text-orange-600">{result.streak.currentStreak}</div>
              <div className="text-xs text-orange-400">days</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star size={18} className="text-purple-500" />
                <span className="text-xs font-medium text-purple-600">Longest Streak</span>
              </div>
              <div className="text-3xl font-extrabold text-purple-600">{result.streak.longestStreak}</div>
              <div className="text-xs text-purple-400">days</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5">
      <Header streak={streak} />

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-4">
        <span className="text-sm text-gray-500 shrink-0">{answeredCount}/{questions.length} answered</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs text-gray-400 font-medium">{q.subject} · {q.topic}</span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-semibold",
                q.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                q.difficulty === "Hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              )}>{q.difficulty}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-3">
              <span className="text-blue-600 font-bold mr-1">Q{qi + 1}.</span> {q.questionText}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(qi, opt.key)}
                  className={cn(
                    "text-left text-sm px-4 py-2.5 rounded-lg border-2 transition-all flex items-center gap-3",
                    answers[qi] === opt.key
                      ? "border-blue-500 bg-blue-50 text-blue-800 font-medium"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                    answers[qi] === opt.key ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-gray-500"
                  )}>{opt.key}</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {submitMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
        Submit Challenge
      </button>
    </div>
  );
}

function Header({ streak }: { streak: { currentStreak: number; longestStreak: number; totalCompleted: number } }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" /> Daily Challenge
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{today} · 10 questions · No time limit</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <Flame size={18} className="text-orange-500" />
          <div>
            <div className="text-lg font-extrabold text-orange-600 leading-none">{streak.currentStreak}</div>
            <div className="text-[10px] text-orange-400 font-medium">day streak</div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <Trophy size={16} className="text-purple-500" />
          <div>
            <div className="text-lg font-extrabold text-purple-600 leading-none">{streak.longestStreak}</div>
            <div className="text-[10px] text-purple-400 font-medium">best</div>
          </div>
        </div>
      </div>
    </div>
  );
}
