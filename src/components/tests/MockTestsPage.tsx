import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Clock, FileText, Users, Star, Play, CheckCircle2, Filter,
} from "lucide-react";
import { MOCK_TESTS } from "@/lib/constants/mockData";
import { cn, getDifficultyColor, getScoreBadgeColor } from "@/lib/utils";
import type { MockTest } from "@/lib/interfaces";

const EXAMS = ["All", "RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"];

export function MockTestsPage() {
  const [examFilter, setExamFilter] = useState("All");
  const [subjectFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");

  const filtered = MOCK_TESTS.filter(t => {
    if (examFilter !== "All" && t.exam !== examFilter) return false;
    if (subjectFilter !== "All") {
      const map: Record<string, string> = { Maths: "maths", Reasoning: "reasoning", GK: "gk", Technical: "technical" };
      if (subjectFilter === "Full Test" && t.subjects.length < 3) return false;
      if (subjectFilter in map && !t.subjects.includes(map[subjectFilter])) return false;
    }
    if (diffFilter !== "All" && t.difficulty !== diffFilter.toLowerCase()) return false;
    return true;
  });

  const attempted = MOCK_TESTS.filter(t => t.isAttempted).length;

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Mock Tests
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{MOCK_TESTS.length} tests · {attempted} attempted</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg font-medium">
            {attempted} Completed
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
            {MOCK_TESTS.length - attempted} Pending
          </div>
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
                    examFilter === e
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
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
              {["All", "Easy", "Medium", "Hard"].map(d => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                    diffFilter === d
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(test => <TestCard key={test.id} test={test} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No tests match the selected filters.</p>
        </div>
      )}
    </div>
  );
}

function TestCard({ test }: { test: MockTest }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#1a56db] to-[#3b82f6]" />

      <div className="flex flex-col h-full justify-between p-4">
        <div className="">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1">{test.title}</h3>
          {test.isAttempted && <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full font-medium">{test.exam}</span>
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", getDifficultyColor(test.difficulty))}>
            {test.difficulty}
          </span>
          {test.negativeMarking && (
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
              <Users size={11} className="text-gray-400" />{(test.totalAttempts / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-gray-400">Attempts</div>
          </div>
        </div>

        {test.isAttempted && test.bestScore !== undefined && (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Star size={13} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-gray-600">Best Score</span>
            </div>
            <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", getScoreBadgeColor(test.bestScore))}>
              {test.bestScore}%
            </span>
          </div>
        )}
        </div>

        <Link
          to="/take-test/$testId"
          params={{ testId: test.id }}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Play size={14} />
          {test.isAttempted ? "Retake Test" : "Start Test"}
        </Link>
      </div>
    </div>
  );
}
