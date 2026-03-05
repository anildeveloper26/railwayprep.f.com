import { Bell, ExternalLink, Calendar, Users, Clock } from "lucide-react";
import { EXAM_NOTIFICATIONS } from "@/lib/constants/mockData";
import { cn, formatDate } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  active:           { label: "Apply Now",        color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  upcoming:         { label: "Upcoming",         color: "bg-blue-100 text-blue-700 border-blue-200",   dot: "bg-blue-500" },
  closed:           { label: "Closed",           color: "bg-gray-100 text-gray-500 border-gray-200",   dot: "bg-gray-400" },
  result_declared:  { label: "Result Out",       color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

export function NotificationsPage() {
  const activeCount = EXAM_NOTIFICATIONS.filter(n => n.status === "active").length;
  const newCount    = EXAM_NOTIFICATIONS.filter(n => n.isNew).length;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Exam Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Stay updated with the latest RRB recruitment news</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {newCount > 0 && (
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> {newCount} New
            </span>
          )}
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
            {activeCount} Active
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Vacancies",  value: "60,651", color: "text-blue-600",  bg: "bg-blue-50" },
          { label: "Active Drives",    value: activeCount, color: "text-green-600", bg: "bg-green-50" },
          { label: "SC Vacancies",     value: "9,164",  color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Apply Closing Soon", value: "2",   color: "text-red-600",   bg: "bg-red-50" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("text-2xl font-extrabold", c.color)}>{c.value}</div>
            <div className="text-gray-500 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {EXAM_NOTIFICATIONS.map(n => {
          const s = STATUS_STYLES[n.status];
          return (
            <div
              key={n.id}
              className={cn(
                "bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md",
                n.isNew ? "border-blue-200" : "border-gray-100"
              )}
            >
              {n.isNew && <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />}

              <div className="p-5">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {n.isNew && (
                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          New
                        </span>
                      )}
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", s.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        {n.examType}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">Posted: {formatDate(n.postedAt)}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-blue-600">{n.vacancyCount.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-gray-400">Total Vacancies</div>
                  </div>
                </div>

                {/* Category Vacancy Table */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Vacancies by Category</div>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(n.categoryWiseVacancy).map(([cat, count]) => (
                      <div key={cat} className="text-center">
                        <div className={cn(
                          "text-xs font-bold px-2 py-1 rounded-lg mb-1",
                          cat === "SC" ? "bg-yellow-100 text-yellow-700" :
                          cat === "ST" ? "bg-orange-100 text-orange-700" :
                          cat === "OBC" ? "bg-blue-100 text-blue-700" :
                          cat === "EWS" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-200 text-gray-700"
                        )}>
                          {cat}
                        </div>
                        <div className="text-sm font-bold text-gray-800">{count.toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: Calendar, label: "Apply Start", val: n.applyStart },
                    { icon: Clock,    label: "Apply End",   val: n.applyEnd },
                    n.examDate ? { icon: Calendar, label: "Exam Date", val: n.examDate } : null,
                    n.resultDate ? { icon: Clock, label: "Result Date", val: n.resultDate } : null,
                  ].filter(Boolean).map((d) => {
                    if (!d) return null;
                    return (
                      <div key={d.label} className="flex items-start gap-2">
                        <d.icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{d.label}</div>
                          <div className="text-xs font-semibold text-gray-800">{formatDate(d.val)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                  {n.status === "active" && (
                    <a
                      href={n.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                      Apply Now <ExternalLink size={13} />
                    </a>
                  )}
                  <a
                    href={n.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    Official Notice <ExternalLink size={13} />
                  </a>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                    <Users size={13} /> {n.vacancyCount.toLocaleString("en-IN")} posts
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
