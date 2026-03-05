import { useState } from "react";
import {
  Settings, Users, FileText, Bell, BarChart2,
  Plus, Edit2, Trash2, Search, ChevronDown,
} from "lucide-react";
import { MOCK_TESTS, EXAM_NOTIFICATIONS, LEADERBOARD } from "@/lib/constants/mockData";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview",  icon: BarChart2,  label: "Overview" },
  { key: "questions", icon: FileText,   label: "Questions" },
  { key: "tests",     icon: FileText,   label: "Mock Tests" },
  { key: "notifications", icon: Bell,   label: "Notifications" },
  { key: "users",     icon: Users,      label: "Users" },
];

export function AdminPage() {
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-blue-600" /> Admin Panel
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage content, tests, and users</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
          Admin Access
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
              tab === t.key
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Users",        value: "50,432", change: "+124 today",   color: "text-blue-600",  bg: "bg-blue-50" },
              { label: "Mock Tests",         value: MOCK_TESTS.length, change: "+2 this week",  color: "text-green-600", bg: "bg-green-50" },
              { label: "Questions in Bank",  value: "5,248",  change: "+50 added",    color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Active Subscriptions", value: "1,842", change: "+23 today",  color: "text-orange-600", bg: "bg-orange-50" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className={cn("text-3xl font-extrabold", s.color)}>{s.value}</div>
                <div className="text-gray-600 text-sm font-medium mt-1">{s.label}</div>
                <div className="text-green-500 text-xs mt-0.5 font-medium">{s.change}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "New user registered", detail: "Priya Kumari (SC category, RRB NTPC)", time: "2 min ago", color: "bg-green-500" },
                { action: "Mock test completed",  detail: "RRB NTPC Full Mock Test #1 by Ravi Teja", time: "5 min ago", color: "bg-blue-500" },
                { action: "Subscription activated", detail: "Monthly plan — Suresh Kumar", time: "12 min ago", color: "bg-purple-500" },
                { action: "New notification posted", detail: "RRB Group D 2025 Vacancy Announcement", time: "1 hr ago", color: "bg-orange-500" },
                { action: "Question added", detail: "Reasoning: Blood Relations (2023 PYQ)", time: "2 hrs ago", color: "bg-indigo-500" },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", a.color)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{a.action}</div>
                    <div className="text-xs text-gray-400">{a.detail}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mock Tests Tab */}
      {tab === "tests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
              <Plus size={15} /> Add Test
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Test Title", "Exam", "Questions", "Duration", "Attempts", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TESTS.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(test => (
                    <tr key={test.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium text-gray-800 max-w-[220px] truncate">{test.title}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{test.exam}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{test.totalQuestions}</td>
                      <td className="py-3 px-4 text-gray-600">{test.duration} min</td>
                      <td className="py-3 px-4 text-gray-600">{test.totalAttempts.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Exam Notifications ({EXAM_NOTIFICATIONS.length})</h3>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
              <Plus size={15} /> Add Notification
            </button>
          </div>
          <div className="space-y-3">
            {EXAM_NOTIFICATIONS.map(n => (
              <div key={n.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {n.vacancyCount.toLocaleString()} vacancies · Status: <span className="font-medium capitalize">{n.status.replace("_", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Rank", "Name", "Category", "Tests", "Avg Score", "Points", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LEADERBOARD
                    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 10)
                    .map(user => (
                      <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-bold text-gray-800">#{user.rank}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-full",
                            user.category === "SC" ? "bg-yellow-100 text-yellow-700" :
                            user.category === "ST" ? "bg-orange-100 text-orange-700" :
                            user.category === "OBC" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {user.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.testsAttempted}</td>
                        <td className="py-3 px-4 font-semibold text-blue-600">{user.averageScore}%</td>
                        <td className="py-3 px-4 text-gray-600">{user.totalPoints}</td>
                        <td className="py-3 px-4">
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {tab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Question Bank</h3>
            <button className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition">
              <Plus size={15} /> Add Question
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Mathematics",  count: "1,842", color: "text-green-600",  bg: "bg-green-50" },
              { label: "Reasoning",    count: "1,567", color: "text-purple-600", bg: "bg-purple-50" },
              { label: "GK & Current Affairs", count: "1,425", color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Technical",    count: "414",   color: "text-red-600",    bg: "bg-red-50"    },
            ].map(s => (
              <div key={s.label} className={cn("rounded-xl p-4 border text-center", s.bg, "border-transparent")}>
                <div className={cn("text-2xl font-extrabold", s.color)}>{s.count}</div>
                <div className="text-gray-600 text-xs font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Full question management coming soon.</p>
            <p className="text-xs mt-1">Add, edit, and delete questions with explanations, images, and categories.</p>
          </div>
        </div>
      )}
    </div>
  );
}
