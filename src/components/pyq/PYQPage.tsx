import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn, getDifficultyColor } from "@/lib/utils";

interface ApiOption { key: "A" | "B" | "C" | "D"; text: string }

interface ApiQuestion {
  _id: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  year?: number;
  exam?: string;
  questionText: string;
  options: ApiOption[];
  isPYQ: boolean;
}

interface FullQuestion extends ApiQuestion {
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

const SUBJECT_MAP: Record<string, string> = {
  Mathematics: "Mathematics",
  Reasoning: "Reasoning",
  "General Knowledge": "General Knowledge",
  Technical: "Technical",
  "Current Affairs": "Current Affairs",
};

const SUBJECT_FILTERS = [
  { key: "all",               label: "All Subjects",      color: "bg-blue-600" },
  { key: "Mathematics",       label: "Mathematics",       color: "bg-green-600" },
  { key: "Reasoning",         label: "Reasoning",         color: "bg-purple-600" },
  { key: "General Knowledge", label: "General Knowledge", color: "bg-orange-600" },
  { key: "Technical",         label: "Technical",         color: "bg-red-600" },
  { key: "Current Affairs",   label: "Current Affairs",   color: "bg-teal-600" },
];

const YEARS = ["All", "2024", "2023", "2022", "2021", "2020", "2019"];

export function PYQPage() {
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fullData, setFullData] = useState<Record<string, FullQuestion>>({});
  const [loadingFull, setLoadingFull] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pyq-questions", subject, year],
    queryFn: () => {
      const params = new URLSearchParams({ isPYQ: "true", limit: "50" });
      if (subject !== "all") params.set("subject", subject);
      if (year !== "All") params.set("year", year);
      return api.get<{ questions: ApiQuestion[]; meta?: { total: number } }>(`/questions?${params}`);
    },
  });

  const { data: topicsData } = useQuery({
    queryKey: ["pyq-topics"],
    queryFn: () => api.get<{ topics: { _id: string; topics: { topic: string; count: number }[]; totalQuestions: number }[] }>("/questions/pyq-topics"),
  });

  const questions = data?.data.questions ?? [];
  const topics = topicsData?.data.topics ?? [];

  const filtered = questions.filter(q => {
    if (search && !q.questionText.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (fullData[id]) return; // already fetched

    setLoadingFull(id);
    try {
      const res = await api.get<{ question: FullQuestion }>(`/questions/${id}`);
      setFullData(prev => ({ ...prev, [id]: res.data.question }));
    } catch {
      // silently ignore
    } finally {
      setLoadingFull(null);
    }
  };

  // Flat topic list for hot topics section
  const hotTopics = topics
    .filter(t => subject === "all" || t._id === subject)
    .flatMap(t => t.topics)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" /> PYQ Question Bank
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Previous year questions with detailed explanations</p>
      </div>

      {/* Subject Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SUBJECT_FILTERS.map(s => {
          const count = s.key === "all"
            ? topics.reduce((sum, t) => sum + t.totalQuestions, 0)
            : topics.find(t => t._id === s.key)?.totalQuestions ?? 0;
          return (
            <button
              key={s.key}
              onClick={() => setSubject(s.key)}
              className={cn(
                "rounded-xl p-3 text-left border-2 transition-all",
                subject === s.key ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-100 bg-white hover:border-blue-200 shadow-sm"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", s.color)}>
                <BookOpen size={14} className="text-white" />
              </div>
              <div className={cn("text-xs font-semibold", subject === s.key ? "text-blue-700" : "text-gray-700")}>
                {s.label}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{count} questions</div>
            </button>
          );
        })}
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
                year === y ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Hot Topics */}
      {hotTopics.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">
            🔥 Most Tested Topics {subject !== "all" && `· ${SUBJECT_MAP[subject] ?? subject}`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {hotTopics.map(t => (
              <span key={t.topic} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                {t.topic} <span className="text-gray-400">({t.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">
            {isLoading ? "Loading..." : `${filtered.length} questions found`}
          </h3>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading questions...
          </div>
        )}

        {filtered.map((q, idx) => {
          const full = fullData[q._id];
          const diffKey = q.difficulty.toLowerCase() as "easy" | "medium" | "hard";

          return (
            <div key={q._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => handleExpand(q._id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <span className="text-xs font-bold text-gray-400 min-w-[24px] mt-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", getDifficultyColor(diffKey))}>
                      {q.difficulty}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {q.subject}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {q.topic}
                    </span>
                    {q.year && (
                      <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {q.year}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">{q.questionText}</p>
                </div>
                <div className="ml-2 flex-shrink-0 text-gray-400">
                  {expanded === q._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {expanded === q._id && (
                <div className="border-t border-gray-50 p-4 bg-gray-50">
                  {loadingFull === q._id && !full ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                      <Loader2 size={14} className="animate-spin" /> Loading answer...
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {(full ?? q).options.map(opt => (
                          <div
                            key={opt.key}
                            className={cn(
                              "flex items-start gap-2 p-3 rounded-xl text-sm border",
                              full && opt.key === full.correctOption
                                ? "bg-green-50 border-green-300 text-green-800"
                                : "bg-white border-gray-200 text-gray-600"
                            )}
                          >
                            <span className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                              full && opt.key === full.correctOption ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                            )}>
                              {opt.key}
                            </span>
                            {opt.text}
                          </div>
                        ))}
                      </div>
                      {full?.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <div className="text-xs font-semibold text-blue-700 mb-1">💡 Explanation</div>
                          <p className="text-sm text-blue-800">{full.explanation}</p>
                        </div>
                      )}
                      {!full && (
                        <p className="text-xs text-gray-400 text-center py-2">Could not load answer details.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No questions match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
