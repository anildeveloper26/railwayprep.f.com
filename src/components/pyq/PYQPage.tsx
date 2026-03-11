import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import { adaptQuestion } from "@/lib/interfaces";
import type { ApiPYQTopic } from "@/lib/interfaces";
import { cn, getDifficultyColor } from "@/lib/utils";
import { DiscussionForum } from "@/components/discussion/DiscussionForum";
import { useLanguage } from "@/lib/context/LanguageContext";

const SUBJECTS = [
  { key: "all",       label: "All Subjects",      color: "bg-blue-600" },
  { key: "maths",     label: "Mathematics",       color: "bg-green-600" },
  { key: "reasoning", label: "Reasoning",         color: "bg-purple-600" },
  { key: "gk",        label: "General Knowledge", color: "bg-orange-600" },
  { key: "technical", label: "Technical",         color: "bg-red-600" },
];

const YEARS = ["All", "2022", "2021", "2020", "2019", "2018"];

export function PYQPage() {
  const { isHindi } = useLanguage();
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["pyq-questions", subject, year, page],
    queryFn: () => questionsApi.list({
      subject: subject !== "all" ? subject : undefined,
      isPYQ: true,
      page,
      limit: 20,
    }),
  });

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ["pyq-topics"],
    queryFn: questionsApi.getPYQTopics,
  });

  const rawQuestions = Array.isArray(questionsData)
    ? questionsData
    : (questionsData as { questions?: unknown[] } | undefined)?.questions ?? [];
  const questions = (rawQuestions as Parameters<typeof adaptQuestion>[0][]).map(adaptQuestion);

  const topics: ApiPYQTopic[] = Array.isArray(topicsData) ? topicsData : [];

  const filtered = questions.filter(q => {
    if (year !== "All" && q.year !== parseInt(year)) return false;
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const subjectCounts = SUBJECTS.map(s => ({
    ...s,
    count: s.key === "all"
      ? questions.length
      : questions.filter(q => q.subject === s.key).length,
  }));

  const visibleTopics = topics.filter(t => subject === "all" || t.subject.toLowerCase() === subject).slice(0, 10);

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" /> PYQ Question Bank
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Previous year questions with explanations</p>
      </div>

      {/* Subject Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {subjectCounts.map(s => (
          <button
            key={s.key}
            onClick={() => { setSubject(s.key); setPage(1); }}
            className={cn(
              "rounded-xl p-3 text-left border-2 transition-all",
              subject === s.key
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-100 bg-white hover:border-blue-200 shadow-sm"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", s.color)}>
              <BookOpen size={14} className="text-white" />
            </div>
            <div className={cn("text-xs font-semibold", subject === s.key ? "text-blue-700" : "text-gray-700")}>
              {s.label}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.count} loaded</div>
          </button>
        ))}
      </div>

      {/* Search + Year Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {YEARS.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                "text-xs px-3 py-2 rounded-lg border font-medium transition",
                year === y
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Hot Topics */}
      {!topicsLoading && visibleTopics.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">
            🔥 Most Tested Topics
            {subject !== "all" && ` · ${SUBJECTS.find(s => s.key === subject)?.label}`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {visibleTopics.map(t => (
              <button
                key={t.topic}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-600 hover:text-blue-700 text-xs px-3 py-1.5 rounded-full transition"
              >
                {t.topic} <span className="text-gray-400">({t.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">{filtered.length} questions</h3>
        </div>

        {questionsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {filtered.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                  className="w-full text-left p-4 flex items-start gap-3"
                >
                  <span className="text-xs font-bold text-gray-400 min-w-[24px] mt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", getDifficultyColor(q.difficulty))}>
                        {q.difficulty}
                      </span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize">
                        {q.subject}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {q.topic}
                      </span>
                      <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {q.year}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      {isHindi && (q as unknown as { questionTextHindi?: string }).questionTextHindi
                        ? (q as unknown as { questionTextHindi: string }).questionTextHindi
                        : q.questionText}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0 text-gray-400">
                    {expanded === q.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {expanded === q.id && (
                  <div className="border-t border-gray-50 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2 p-3 rounded-xl text-sm border",
                            i === q.correctAnswer
                              ? "bg-green-50 border-green-300 text-green-800"
                              : "bg-white border-gray-200 text-gray-600"
                          )}
                        >
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                            i === q.correctAnswer ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                          )}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <div className="text-xs font-semibold text-blue-700 mb-1">💡 Explanation</div>
                      <p className="text-sm text-blue-800">{q.explanation}</p>
                    </div>
                    <DiscussionForum questionId={q.id} />
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No questions match your filters.</p>
              </div>
            )}

            {/* Pagination */}
            {questions.length === 20 && (
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
