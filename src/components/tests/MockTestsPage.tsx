import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, FileText, Users, Play, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn, getDifficultyColor } from "@/lib/utils";

interface ApiTest {
  _id: string;
  title: string;
  exam: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  totalAttempts: number;
  averageScore: number;
  isPremium: boolean;
  sections: { subject: string; questionCount: number; negativeMarks: number }[];
}

const EXAMS = ["All", "RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export function MockTestsPage() {
  const [examFilter, setExamFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["tests", examFilter, diffFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (examFilter !== "All") params.set("exam", examFilter);
      if (diffFilter !== "All") params.set("difficulty", diffFilter);
      return api.get<{ tests: ApiTest[] }>(`/tests?${params}`);
    },
  });

  const tests = data?.data.tests ?? [];

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Mock Tests
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{tests.length} tests available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1.5 font-medium">Exam</div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMS.map(e => (
                <button
                  key={e}
                  onClick={() => setExamFilter(e)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                    examFilter === e ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1.5 font-medium">Difficulty</div>
            <div className="flex gap-1.5">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                    diffFilter === d ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading tests...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tests.map(test => <TestCard key={test._id} test={test} />)}
        </div>
      )}

      {!isLoading && tests.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No tests match the selected filters.</p>
        </div>
      )}
    </div>
  );
}

function TestCard({ test }: { test: ApiTest }) {
  const diffKey = test.difficulty.toLowerCase() as "easy" | "medium" | "hard";
  const hasNegative = test.sections.some(s => s.negativeMarks > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#1a56db] to-[#3b82f6]" />

      <div className="flex flex-col h-full justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1">{test.title}</h3>
            {test.isPremium && (
              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">PRO</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-medium">{test.exam}</span>
            <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", getDifficultyColor(diffKey))}>
              {test.difficulty}
            </span>
            {hasNegative && (
              <span className="bg-red-50 text-red-600 text-[11px] px-2 py-0.5 rounded-full font-medium">-ve marking</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="text-base font-bold text-gray-900">{test.totalQuestions}</div>
              <div className="text-[10px] text-gray-400">Questions</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                <Clock size={11} className="text-gray-400" />{test.duration}m
              </div>
              <div className="text-[10px] text-gray-400">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
                <Users size={11} className="text-gray-400" />{test.totalAttempts.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-gray-400">Attempts</div>
            </div>
          </div>
        </div>

        <Link
          to="/take-test/$testId"
          params={{ testId: test._id }}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Play size={14} /> Start Test
        </Link>
      </div>
    </div>
  );
}
