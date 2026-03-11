import { Bell, Clock, Loader2, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import type { ApiNotification } from "@/lib/interfaces";
import { cn, formatDate } from "@/lib/utils";

const TYPE_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; dot: string }> = {
  info:    { icon: Info,          color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" },
  success: { icon: CheckCircle2,  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-500" },
  error:   { icon: XCircle,       color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500" },
};

export function NotificationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
  });

  const notifications: ApiNotification[] = Array.isArray(data) ? data : [];
  const infoCount    = notifications.filter(n => n.type === "info").length;
  const warningCount = notifications.filter(n => n.type === "warning").length;
  const successCount = notifications.filter(n => n.type === "success").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load notifications. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Stay updated with the latest announcements</p>
        </div>
        {notifications.length > 0 && (
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: notifications.length, color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Info",     value: infoCount,            color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Warnings", value: warningCount,         color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Success",  value: successCount,         color: "text-green-600",  bg: "bg-green-50" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("text-2xl font-extrabold", c.color)}>{c.value}</div>
            <div className="text-gray-500 text-xs mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Notification Cards */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
            const Icon = style.icon;
            return (
              <div
                key={n._id}
                className={cn(
                  "bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md",
                  style.border
                )}
              >
                <div className={cn("h-1", style.dot.replace("bg-", "bg-"))} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", style.bg)}>
                      <Icon size={18} className={style.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                          style.bg, style.color, style.border
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                          {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{n.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
