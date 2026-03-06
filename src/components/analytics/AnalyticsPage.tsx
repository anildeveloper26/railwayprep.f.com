import { BarChart2, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

interface AnalyticsData {
  recentTests: { date: string; score: number; name: string }[];
  subjectWise: { subject: string; total: number; correct: number; percentage: number }[];
  weeklyActivity: { day: string; questions: number }[];
  accuracy: number;
  averageTime: number;
  totalAttempts: number;
}

export function AnalyticsPage() {
  const user = getStoredUser();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get<AnalyticsData>("/analytics"),
  });

  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading analytics...
      </div>
    );
  }

  const subjectWise = analytics?.subjectWise ?? [];
  const recentTests = analytics?.recentTests ?? [];
  const weeklyActivity = analytics?.weeklyActivity ?? [];
  const accuracy = analytics?.accuracy ?? 0;
  const averageTime = analytics?.averageTime ?? 0;

  // Derive strong/weak topics from subject data
  const sortedSubjects = [...subjectWise].sort((a, b) => b.percentage - a.percentage);
  const strongTopics = sortedSubjects.filter(s => s.percentage >= 70).map(s => s.subject);
  const weakTopics = sortedSubjects.filter(s => s.percentage < 60).map(s => s.subject);

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 size={20} className="text-blue-600" /> Performance Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Detailed breakdown of your preparation progress</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target,     label: "Overall Accuracy",  value: `${accuracy}%`,             color: "text-blue-600",   bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Avg Score",         value: `${user?.averageScore ?? 0}%`, color: "text-green-600",  bg: "bg-green-50" },
          { icon: Clock,      label: "Avg Time / Q",      value: `${averageTime}s`,           color: "text-orange-600", bg: "bg-orange-50" },
          { icon: BarChart2,  label: "Tests Attempted",   value: analytics?.totalAttempts ?? user?.testsAttempted ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {subjectWise.length === 0 && recentTests.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No data yet</p>
          <p className="text-sm mt-1">Take some mock tests to see your analytics here.</p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          {subjectWise.length > 0 && recentTests.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Subject-wise Score */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Subject-wise Accuracy</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectWise} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v) => [`${v ?? 0}%`, "Accuracy"]}
                    />
                    <Bar dataKey="percentage" fill="#1a56db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Score Trend */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Score Trend (Last {recentTests.length} Tests)</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={recentTests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(v, _, props) => [`${v ?? 0}%`, (props.payload as { name?: string }).name ?? ""]}
                    />
                    <Line type="monotone" dataKey="score" stroke="#1a56db" strokeWidth={2.5} dot={{ r: 4, fill: "#1a56db" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weekly Activity */}
          {weeklyActivity.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">This Week's Activity</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyActivity} barSize={28}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="questions" name="Questions" fill="#1a56db" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Strong vs Weak */}
          {(strongTopics.length > 0 || weakTopics.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" /> Strong Subjects
                </h2>
                <div className="space-y-2">
                  {strongTopics.length > 0 ? strongTopics.map(t => (
                    <div key={t} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Strong</span>
                    </div>
                  )) : <p className="text-sm text-gray-400">Keep attempting tests to identify strengths.</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" /> Needs Improvement
                </h2>
                <div className="space-y-2">
                  {weakTopics.length > 0 ? weakTopics.map(t => (
                    <div key={t} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t}</span>
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Focus more</span>
                    </div>
                  )) : <p className="text-sm text-gray-400">Great! No weak areas detected.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Subject-wise detail */}
          {subjectWise.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Subject-wise Accuracy</h2>
              <div className="space-y-3">
                {subjectWise.map(s => (
                  <div key={s.subject}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{s.subject}</span>
                      <span className={cn(
                        "text-xs font-bold",
                        s.percentage >= 80 ? "text-green-600" : s.percentage >= 60 ? "text-blue-600" : s.percentage >= 40 ? "text-yellow-600" : "text-red-600"
                      )}>
                        {s.percentage}% ({s.correct}/{s.total})
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          s.percentage >= 80 ? "bg-green-500" : s.percentage >= 60 ? "bg-blue-500" : s.percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
