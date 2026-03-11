import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Users, Trophy, Play, CheckCircle2, Loader2, Radio } from "lucide-react";
import { eventsApi, type ApiEvent } from "@/lib/api";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

export function LiveEventsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ApiEvent | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["events", statusFilter],
    queryFn: () => eventsApi.list(statusFilter === "all" ? undefined : statusFilter),
    refetchInterval: 30000, // refresh every 30s to pick up status changes
  });

  const { data: lbData } = useQuery({
    queryKey: ["event-leaderboard", selected?._id],
    queryFn: () => eventsApi.leaderboard(selected!._id),
    enabled: !!selected && showLeaderboard,
  });

  const registerMutation = useMutation({
    mutationFn: (id: string) => eventsApi.register(id),
    onSuccess: () => {
      toast.success("Registered! You'll be notified before the event starts.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Registration failed"),
  });

  const events: ApiEvent[] = (data?.events ?? []) as ApiEvent[];
  const leaderboard = lbData?.leaderboard ?? [];

  function formatDateTime(dt: string) {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function timeUntil(dt: string) {
    const diff = new Date(dt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    return `${h}h ${m}m`;
  }

  const STATUS_COLORS: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-700",
    live: "bg-red-100 text-red-700 animate-pulse",
    ended: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Radio size={20} className="text-red-500" /> Live Test Events
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Compete with all aspirants simultaneously in real exam conditions</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {["all", "upcoming", "live", "ended"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium capitalize transition-colors",
              statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
            {s === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events {statusFilter !== "all" ? `with status "${statusFilter}"` : "available"} right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(ev => {
            const countdown = timeUntil(ev.scheduledAt);
            const isSelected = selected?._id === ev._id;
            return (
              <div key={ev._id}
                className={cn("bg-white rounded-xl border-2 shadow-sm overflow-hidden transition cursor-pointer hover:shadow-md",
                  isSelected ? "border-blue-500" : "border-gray-100",
                  ev.status === "live" && "border-red-400")}>
                <div className="h-1.5 bg-linear-to-r from-blue-600 to-indigo-500" />
                <div className="p-4" onClick={() => { setSelected(isSelected ? null : ev); setShowLeaderboard(false); }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1">{ev.title}</h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 capitalize", STATUS_COLORS[ev.status])}>
                      {ev.status === "live" && "🔴 "}{ev.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDateTime(ev.scheduledAt)}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {ev.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><Users size={11} /> {ev.registeredCount} registered</span>
                  </div>

                  {ev.testId && (
                    <div className="text-xs text-gray-400 mb-3">
                      {ev.testId.totalQuestions} questions · {ev.exam}
                    </div>
                  )}

                  {countdown && ev.status === "upcoming" && (
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium mb-3">
                      ⏰ Starts in {countdown}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {ev.status === "upcoming" && !ev.isRegistered && (
                      <button onClick={e => { e.stopPropagation(); registerMutation.mutate(ev._id); }}
                        disabled={registerMutation.isPending}
                        className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                        Register
                      </button>
                    )}
                    {ev.status === "upcoming" && ev.isRegistered && (
                      <div className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 text-xs font-semibold py-2 rounded-lg">
                        <CheckCircle2 size={12} /> Registered
                      </div>
                    )}
                    {ev.status === "live" && ev.isRegistered && (
                      <button className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white text-xs font-semibold py-2 rounded-lg hover:bg-red-600 animate-pulse">
                        <Play size={12} /> Join Live
                      </button>
                    )}
                    {ev.status === "ended" && (
                      <button onClick={e => { e.stopPropagation(); setSelected(ev); setShowLeaderboard(true); }}
                        className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50">
                        <Trophy size={12} /> Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard panel */}
      {selected && showLeaderboard && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" /> {selected.title} — Final Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600")}>
                    {entry.rank}
                  </span>
                  <span className="flex-1 text-sm text-gray-800">{entry.user.name}</span>
                  <span className="text-xs text-gray-400">{formatTime(entry.timeTaken)}</span>
                  <span className="text-sm font-bold text-blue-600">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
