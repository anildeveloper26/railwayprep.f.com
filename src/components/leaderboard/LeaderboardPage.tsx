import { useState } from "react";
import { Trophy, Medal, Crown, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

interface LeaderEntry {
  rank: number;
  userId: string;
  name: string;
  category: string;
  targetExam: string;
  testsAttempted: number;
  averageScore: number;
  totalPoints: number;
}

const CATEGORIES = ["All", "General", "OBC", "SC", "ST", "EWS"];

const BADGE_ICONS: Record<number, React.ReactNode> = {
  1: <Crown  size={14} className="text-yellow-500 fill-yellow-400" />,
  2: <Medal  size={14} className="text-gray-400 fill-gray-300" />,
  3: <Trophy size={14} className="text-amber-700 fill-amber-600" />,
};

export function LeaderboardPage() {
  const [catFilter, setCatFilter] = useState("All");
  const user = getStoredUser();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", catFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" });
      if (catFilter !== "All") params.set("category", catFilter);
      return api.get<{ leaderboard: LeaderEntry[]; myRank: number | null }>(`/leaderboard?${params}`);
    },
  });

  const leaderboard = data?.data.leaderboard ?? [];
  const myRank = data?.data.myRank;
  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">See how you rank against other RRB aspirants</p>
      </div>

      {/* My Rank Banner */}
      {user && myRank && (
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1a56db] rounded-2xl p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
              #{myRank}
            </div>
            <div>
              <div className="font-semibold">Your Current Rank</div>
              <div className="text-blue-200 text-xs">
                {user.averageScore}% avg · {user.testsAttempted} tests · {user.category} category
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-2 rounded-xl">
            <TrendingUp size={16} className="text-green-300" />
            <span className="text-sm font-medium">{user.totalPoints} pts</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={cn(
              "text-xs px-3.5 py-2 rounded-xl border font-semibold transition",
              catFilter === c
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            )}
          >
            {c === "General" ? "General (UR)" : c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading leaderboard...
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[top3[1], top3[0], top3[2]].map((entry, i) => {
                if (!entry) return null;
                const colors   = ["bg-gray-100",   "bg-yellow-50",   "bg-amber-50"];
                const borders  = ["border-gray-200", "border-yellow-300", "border-amber-200"];
                const labels   = ["2nd", "1st", "3rd"];
                const medals   = ["🥈", "🥇", "🥉"];
                return (
                  <div key={entry.userId} className={cn("flex flex-col items-center rounded-2xl border-2 p-4", colors[i], borders[i])}>
                    <div className="text-2xl mb-1">{medals[i]}</div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm mb-1">
                      {entry.name[0]}
                    </div>
                    <div className="text-xs font-semibold text-gray-800 text-center truncate w-full">{entry.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{entry.category}</div>
                    <div className="text-lg font-extrabold text-gray-900 mt-1">{entry.averageScore.toFixed(1)}%</div>
                    <div className="text-[10px] text-gray-400">{labels[i]}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">Rankings</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {leaderboard.map(entry => {
                const isMe = entry.userId === user?._id;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3 transition-colors",
                      isMe ? "bg-blue-50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      entry.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      entry.rank === 2 ? "bg-gray-100 text-gray-600" :
                      entry.rank === 3 ? "bg-amber-100 text-amber-700" :
                      isMe ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-500"
                    )}>
                      {BADGE_ICONS[entry.rank] ?? `#${entry.rank}`}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {entry.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold truncate", isMe ? "text-blue-700" : "text-gray-800")}>
                          {entry.name}
                        </span>
                        {isMe && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">You</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {entry.testsAttempted} tests · {entry.category}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-gray-900">{entry.averageScore.toFixed(1)}%</div>
                      <div className="text-xs text-gray-400">{entry.totalPoints} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No entries for this category yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
