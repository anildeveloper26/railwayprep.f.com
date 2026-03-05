import { BarChart2, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ANALYTICS_DATA, CURRENT_USER } from "@/lib/constants/mockData";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

export function AnalyticsPage() {
  const { subjectWise, topicWise, recentTests, weeklyActivity, accuracy, averageTime, strongTopics, weakTopics } = ANALYTICS_DATA;

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
          { icon: Target,     label: "Overall Accuracy",  value: `${accuracy}%`,      color: "text-blue-600",   bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Avg Score",         value: `${CURRENT_USER.averageScore}%`, color: "text-green-600",  bg: "bg-green-50" },
          { icon: Clock,      label: "Avg Time / Q",      value: `${averageTime}s`,   color: "text-orange-600", bg: "bg-orange-50" },
          { icon: BarChart2,  label: "Tests Attempted",   value: CURRENT_USER.testsAttempted, color: "text-purple-600", bg: "bg-purple-50" },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject-wise Score */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Subject-wise Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectWise} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [`${v ?? 0}%`, "Score"]}
              />
              <Bar dataKey="percentage" fill="#1a56db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Trend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Score Trend (Last 6 Tests)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recentTests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v, _, props) => [`${v ?? 0}%`, (props.payload as { name?: string }).name ?? ""]}
              />
              <Line type="monotone" dataKey="score" stroke="#1a56db" strokeWidth={2.5} dot={{ r: 4, fill: "#1a56db" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Activity */}
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

      {/* Strong vs Weak Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" /> Strong Topics
          </h2>
          <div className="space-y-2">
            {strongTopics.map(topic => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{topic}</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Strong
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Needs Improvement
          </h2>
          <div className="space-y-2">
            {weakTopics.map(topic => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{topic}</span>
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Focus more
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic-wise Accuracy */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Topic-wise Accuracy</h2>
        <div className="space-y-3">
          {topicWise.map(t => {
            const pct = Math.round((t.correct / t.total) * 100);
            return (
              <div key={t.topic}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{t.topic}</span>
                  <span className={cn(
                    "text-xs font-bold",
                    pct >= 80 ? "text-green-600" : pct >= 60 ? "text-blue-600" : pct >= 40 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {pct}% ({t.correct}/{t.total})
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
