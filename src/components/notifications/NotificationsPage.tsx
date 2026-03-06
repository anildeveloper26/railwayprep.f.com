import { Bell, ExternalLink, Calendar, Users, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

interface ApiNotification {
  _id: string;
  title: string;
  exam: string;
  boardName: string;
  vacancyCount: number;
  vacancyBreakdown: { general: number; obc: number; sc: number; st: number; ews: number };
  status: "upcoming" | "application_open" | "application_closed" | "admit_card" | "result_declared";
  applicationStartDate?: string;
  applicationEndDate?: string;
  examDate?: string;
  resultDate?: string;
  officialLink: string;
  importantDates: { label: string; date: string }[];
  eligibility: { qualification: string; ageMin: number; ageMax: number };
  createdAt: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string; dot: string }> = {
  application_open:   { label: "Apply Now",  color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500"  },
  upcoming:           { label: "Upcoming",   color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500"   },
  application_closed: { label: "Closed",     color: "bg-gray-100 text-gray-500 border-gray-200",     dot: "bg-gray-400"   },
  admit_card:         { label: "Admit Card", color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  result_declared:    { label: "Result Out", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

export function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ notifications: ApiNotification[] }>("/notifications?limit=20"),
  });

  const notifications = data?.data.notifications ?? [];
  const activeCount = notifications.filter(n => n.status === "application_open").length;
  const totalVacancies = notifications.reduce((sum, n) => sum + n.vacancyCount, 0);
  const scVacancies = notifications.reduce((sum, n) => sum + (n.vacancyBreakdown?.sc ?? 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading notifications...
      </div>
    );
  }

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
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
            {activeCount} Active
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Vacancies",    value: totalVacancies.toLocaleString("en-IN"), color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Active Drives",      value: activeCount,                            color: "text-green-600",  bg: "bg-green-50" },
          { label: "SC Vacancies",       value: scVacancies.toLocaleString("en-IN"),    color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Total Notifications", value: notifications.length,                  color: "text-red-600",    bg: "bg-red-50" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("text-2xl font-extrabold", c.color)}>{c.value}</div>
            <div className="text-gray-500 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-4">
        {notifications.map(n => {
          const s = STATUS_STYLES[n.status] ?? STATUS_STYLES["upcoming"];
          const breakdown = n.vacancyBreakdown ?? {};
          const catEntries = [
            ["UR", breakdown.general ?? 0],
            ["OBC", breakdown.obc ?? 0],
            ["SC", breakdown.sc ?? 0],
            ["ST", breakdown.st ?? 0],
            ["EWS", breakdown.ews ?? 0],
          ] as [string, number][];

          return (
            <div
              key={n._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="p-5">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", s.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                        {s.label}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        {n.exam}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{n.boardName} · Posted: {formatDate(n.createdAt)}</p>
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
                    {catEntries.map(([cat, count]) => (
                      <div key={cat} className="text-center">
                        <div className={cn(
                          "text-xs font-bold px-2 py-1 rounded-lg mb-1",
                          cat === "SC"  ? "bg-yellow-100 text-yellow-700" :
                          cat === "ST"  ? "bg-orange-100 text-orange-700" :
                          cat === "OBC" ? "bg-blue-100 text-blue-700" :
                          cat === "EWS" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-200 text-gray-700"
                        )}>
                          {cat}
                        </div>
                        <div className="text-sm font-bold text-gray-800">{(count as number).toLocaleString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                {n.eligibility && (
                  <div className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Eligibility:</span> {n.eligibility.qualification} · Age {n.eligibility.ageMin}–{n.eligibility.ageMax} yrs
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    n.applicationStartDate ? { icon: Calendar, label: "Apply Start", val: n.applicationStartDate } : null,
                    n.applicationEndDate   ? { icon: Clock,    label: "Apply End",   val: n.applicationEndDate }   : null,
                    n.examDate             ? { icon: Calendar, label: "Exam Date",   val: n.examDate }             : null,
                    n.resultDate           ? { icon: Clock,    label: "Result Date", val: n.resultDate }           : null,
                  ].filter(Boolean).map(d => {
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
                  {n.status === "application_open" && (
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

      {notifications.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>No notifications available.</p>
        </div>
      )}
    </div>
  );
}
