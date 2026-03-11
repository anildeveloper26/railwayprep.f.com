import { Link } from "@tanstack/react-router";
import {
  FileText, BookOpen, Bell, BarChart2, Trophy, Calendar,
  TrendingUp, Clock, Target, Zap, ChevronRight, ArrowRight, Train,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi, testsApi, notificationsApi, analyticsApi } from "@/lib/api";
import { adaptUser, adaptTest } from "@/lib/interfaces";
import { cn, getScoreBadgeColor } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const { data: testsData } = useQuery({ queryKey: ["tests"], queryFn: () => testsApi.list({ limit: 50 }) });
  const { data: notifications } = useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.list });
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: analyticsApi.getMy, retry: false });

  const user = apiUser ? adaptUser(apiUser) : null;

  const rawTests = Array.isArray(testsData) ? testsData : (testsData as { tests?: typeof testsData[] } | undefined)?.tests ?? [];
  const tests = (rawTests as Parameters<typeof adaptTest>[0][]).map(adaptTest);
  const recentTests = tests.filter(t => t.isAttempted).slice(0, 3);

  const latestNotification = Array.isArray(notifications) ? notifications[0] : null;

  const chartData = analytics?.weeklyActivity ?? [
    { day: "Mon", questions: 0 }, { day: "Tue", questions: 0 }, { day: "Wed", questions: 0 },
    { day: "Thu", questions: 0 }, { day: "Fri", questions: 0 }, { day: "Sat", questions: 0 }, { day: "Sun", questions: 0 },
  ];

  const quickStats = [
    { icon: FileText,   label: "Tests Taken",  value: user?.testsAttempted ?? 0,          color: "bg-slate-100 text-slate-700",   link: "/mock-tests" },
    { icon: TrendingUp, label: "Avg Score",    value: `${user?.averageScore ?? 0}%`,       color: "bg-green-50 text-green-700",    link: "/analytics" },
    { icon: Trophy,     label: "Your Rank",    value: user?.rank ? `#${user.rank}` : "—", color: "bg-amber-50 text-amber-700",    link: "/leaderboard" },
    { icon: Target,     label: "Target Exam",  value: user?.targetExam ?? "—",             color: "bg-orange-50 text-orange-700",  link: "/notifications" },
  ];

  const quickLinks = [
    { icon: FileText, label: "Take Mock Test",  path: "/mock-tests",    color: "bg-slate-700",   desc: `${tests.length} tests available` },
    { icon: BookOpen, label: "Practice PYQs",   path: "/pyq",           color: "bg-green-600",   desc: "Previous year questions" },
    { icon: Bell,     label: "Exam Alerts",     path: "/notifications", color: "bg-amber-500",   desc: "Latest notifications" },
    { icon: Calendar, label: "Study Planner",   path: "/planner",       color: "bg-slate-600",   desc: "Plan your week" },
    { icon: BarChart2,label: "My Analytics",    path: "/analytics",     color: "bg-brand-500",  desc: "Track progress" },
    { icon: Trophy,   label: "Leaderboard",     path: "/leaderboard",   color: "bg-yellow-500",  desc: user?.rank ? `Rank #${user.rank}` : "See rankings" },
  ];

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-5">
          <Train size={120} />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">
              Good morning, {user?.name?.split(" ")[0] ?? "there"}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Ready to crack {user?.targetExam ?? "your exam"}?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center bg-white/8 border border-white/10 rounded-xl px-4 py-2">
              <div className="text-2xl font-bold text-brand-400">{user?.averageScore ?? 0}%</div>
              <div className="text-slate-400 text-xs">Avg Score</div>
            </div>
            {user?.rank ? (
              <div className="text-center bg-white/8 border border-white/10 rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-brand-400">#{user.rank}</div>
                <div className="text-slate-400 text-xs">Overall Rank</div>
              </div>
            ) : null}
          </div>
        </div>
        {user?.subscriptionPlan === "free" && (
          <div className="mt-4 bg-white/6 border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-brand-400" />
              <span className="text-sm text-slate-300">Upgrade to unlock unlimited mock tests & analytics</span>
            </div>
            <Link to="/subscription" className="bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
              Upgrade ₹199/mo
            </Link>
          </div>
        )}
      </div>

      {/* Exam Alert Banner */}
      {latestNotification && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-amber-600" />
            <div>
              <div className="font-semibold text-amber-900 text-sm">{latestNotification.title}</div>
              <div className="text-amber-600 text-xs mt-0.5">
                {new Date(latestNotification.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
          <Link to="/notifications" className="text-amber-700 text-sm font-semibold flex items-center gap-1 hover:text-amber-900">
            View <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(stat => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Grid: Chart + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">This Week's Activity</h2>
            <Link to="/analytics" className="text-brand-500 text-xs flex items-center gap-1 hover:underline font-medium">
              Full Analytics <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{ border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [v, "Questions"]}
              />
              <Line type="monotone" dataKey="questions" stroke="var(--brand-500)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--brand-500)" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Access</h2>
          <div className="space-y-2">
            {quickLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-8 h-8 ${link.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <link.icon size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 group-hover:text-brand-500 transition-colors">{link.label}</div>
                  <div className="text-xs text-gray-400">{link.desc}</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={16} className="text-brand-500" /> Recent Tests
            </h2>
            <Link to="/mock-tests" className="text-brand-500 text-sm flex items-center gap-1 hover:underline font-medium">
              All Tests <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTests.map(test => (
              <div key={test.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="font-medium text-gray-800 text-sm">{test.title}</div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    {test.totalQuestions} questions · {test.duration} min · {test.exam}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {test.bestScore !== undefined && (
                    <span className={cn("text-sm font-bold px-2.5 py-1 rounded-full", getScoreBadgeColor(test.bestScore))}>
                      {test.bestScore}%
                    </span>
                  )}
                  <Link
                    to="/mock-tests"
                    className="text-slate-600 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                  >
                    Retake
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
