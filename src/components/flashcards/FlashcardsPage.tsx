import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronRight, ChevronLeft, CheckCircle2, XCircle, RotateCcw, Plus, Loader2, TrendingUp } from "lucide-react";
import { flashcardsApi } from "@/lib/api";
import type { FlashcardResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SUBJECTS = ["All", "Mathematics", "Reasoning", "General Knowledge", "Technical", "Current Affairs"];

type Flashcard = {
  _id: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  tags: string[];
  isCustom: boolean;
  isDue: boolean;
  progress: { repetitions: number; lastResult: string; nextReviewDate: string } | null;
};

export function FlashcardsPage() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("All");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<"study" | "progress">("study");

  // Add custom card form
  const [form, setForm] = useState({ subject: "Mathematics", topic: "", front: "", back: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["flashcards", subject],
    queryFn: () => flashcardsApi.list({ subject, limit: 30 }),
  });

  const { data: progressData } = useQuery({
    queryKey: ["flashcards-progress"],
    queryFn: flashcardsApi.getProgress,
  });

  const cards: Flashcard[] = (data?.flashcards ?? []) as Flashcard[];
  const card = cards[cardIndex];

  const reviewMutation = useMutation({
    mutationFn: ({ id, result }: { id: string; result: FlashcardResult }) =>
      flashcardsApi.review(id, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["flashcards-progress"] });
      setFlipped(false);
      setCardIndex(p => Math.min(p + 1, cards.length - 1));
    },
    onError: () => toast.error("Failed to record review"),
  });

  const createMutation = useMutation({
    mutationFn: flashcardsApi.createCustom,
    onSuccess: () => {
      toast.success("Flashcard created!");
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      setShowAdd(false);
      setForm({ subject: "Mathematics", topic: "", front: "", back: "" });
    },
    onError: () => toast.error("Failed to create flashcard"),
  });

  function handleReview(result: FlashcardResult) {
    if (!card) return;
    reviewMutation.mutate({ id: card._id, result });
  }

  const dueCount = cards.filter(c => c.isDue).length;

  return (
    <div className="p-5 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" /> Flashcards
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Spaced repetition for key facts and formulas</p>
        </div>
        <div className="flex items-center gap-2">
          {dueCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
              {dueCount} due today
            </span>
          )}
          <button
            onClick={() => setShowAdd(p => !p)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={14} /> Add Card
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["study", "progress"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "progress" ? "My Progress" : "Study"}
          </button>
        ))}
      </div>

      {/* Add card form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Create Custom Flashcard</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Subject</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              >
                {SUBJECTS.filter(s => s !== "All").map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Topic</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Profit & Loss"
                value={form.topic}
                onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Front (Question / Prompt)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="What is the formula for..."
              value={form.front}
              onChange={e => setForm(p => ({ ...p, front: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Back (Answer)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="The answer is..."
              value={form.back}
              onChange={e => setForm(p => ({ ...p, back: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.front || !form.back || !form.topic || createMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {tab === "study" && (
        <>
          {/* Subject filter */}
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => { setSubject(s); setCardIndex(0); setFlipped(false); }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                  subject === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No flashcards for this subject yet.</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-blue-600 text-sm hover:underline">
                Create one
              </button>
            </div>
          ) : (
            <>
              {/* Counter */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{cardIndex + 1} of {cards.length}</span>
                <button
                  onClick={() => { setCardIndex(0); setFlipped(false); }}
                  className="flex items-center gap-1 hover:text-gray-600 transition"
                >
                  <RotateCcw size={13} /> Restart
                </button>
              </div>

              {/* Card */}
              <div
                onClick={() => setFlipped(p => !p)}
                className="cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow min-h-65 flex flex-col items-center justify-center p-8 text-center relative"
              >
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                    {card?.subject} · {card?.topic}
                  </span>
                </div>
                {card?.isDue && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">DUE</span>
                  </div>
                )}

                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-4">
                  {flipped ? "Answer" : "Question"}
                </div>
                <p className={cn(
                  "leading-relaxed font-medium",
                  flipped ? "text-base text-blue-700" : "text-lg text-gray-800"
                )}>
                  {flipped ? card?.back : card?.front}
                </p>
                {!flipped && (
                  <p className="mt-4 text-xs text-gray-400">Tap to reveal answer</p>
                )}
              </div>

              {/* Review buttons */}
              {flipped && (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleReview("again")}
                    disabled={reviewMutation.isPending}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    <span className="text-xs font-semibold">Again</span>
                  </button>
                  <button
                    onClick={() => handleReview("hard")}
                    disabled={reviewMutation.isPending}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition disabled:opacity-50"
                  >
                    <RotateCcw size={20} />
                    <span className="text-xs font-semibold">Hard</span>
                  </button>
                  <button
                    onClick={() => handleReview("easy")}
                    disabled={reviewMutation.isPending}
                    className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} />
                    <span className="text-xs font-semibold">Easy</span>
                  </button>
                </div>
              )}

              {/* Navigation */}
              {!flipped && (
                <div className="flex justify-between">
                  <button
                    onClick={() => { setCardIndex(p => Math.max(0, p - 1)); setFlipped(false); }}
                    disabled={cardIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={() => { setCardIndex(p => Math.min(cards.length - 1, p + 1)); setFlipped(false); }}
                    disabled={cardIndex === cards.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "progress" && (
        <div className="space-y-4">
          {(progressData?.progress ?? []).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No progress yet. Start studying to see your mastery!</p>
            </div>
          ) : (
            progressData?.progress.map(p => (
              <div key={p.subject} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-800">{p.subject}</span>
                  <span className={cn(
                    "text-sm font-bold",
                    p.masteryPercent >= 80 ? "text-green-600" : p.masteryPercent >= 50 ? "text-blue-600" : "text-orange-600"
                  )}>
                    {p.masteryPercent}% mastered
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      p.masteryPercent >= 80 ? "bg-green-500" : p.masteryPercent >= 50 ? "bg-blue-500" : "bg-orange-500"
                    )}
                    style={{ width: `${p.masteryPercent}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">{p.mastered}/{p.total} cards mastered</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
