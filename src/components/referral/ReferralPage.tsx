import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Copy, CheckCircle2, Users, Star, Loader2, Coins } from "lucide-react";
import { referralsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReferralPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const [showApply, setShowApply] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: referralsApi.getStats,
  });

  const redeemMutation = useMutation({
    mutationFn: referralsApi.redeem,
    onSuccess: (res) => {
      toast.success(`Redeemed ${res.daysRedeemed} premium days!`);
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("No credits available to redeem"),
  });

  const applyMutation = useMutation({
    mutationFn: () => referralsApi.apply(applyCode),
    onSuccess: () => {
      toast.success("Referral applied! You got 3 bonus premium days.");
      setShowApply(false);
      setApplyCode("");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Invalid or already used code";
      toast.error(message);
    },
  });

  function copyCode() {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Gift size={20} className="text-pink-500" /> Refer & Earn
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Earn 7 free premium days for every friend who joins</p>
      </div>

      {/* How it works */}
      <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white">
        <h2 className="font-bold text-base mb-4">How it works</h2>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { step: "1", label: "Share your code", desc: "Send to classmates" },
            { step: "2", label: "They register", desc: "Using your code" },
            { step: "3", label: "You earn 7 days", desc: "Free premium access" },
          ].map(s => (
            <div key={s.step} className="bg-white/10 rounded-xl p-3">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                {s.step}
              </div>
              <div className="font-semibold text-xs">{s.label}</div>
              <div className="text-white/70 text-[10px] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Your code */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-gray-900 tracking-widest text-center">
            {stats?.referralCode ?? "—"}
          </div>
          <button
            onClick={copyCode}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
              copied ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Your friend gets 3 bonus days when they use this code
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Users, label: "Total Referrals", value: stats?.totalReferrals ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CheckCircle2, label: "Converted", value: stats?.convertedReferrals ?? 0, color: "text-green-600", bg: "bg-green-50" },
          { icon: Coins, label: "Pending Credits", value: `${stats?.pendingCredits ?? 0} days`, color: "text-orange-600", bg: "bg-orange-50" },
          { icon: Star, label: "Redeemed", value: `${stats?.redeemedCredits ?? 0} days`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Redeem */}
      {(stats?.pendingCredits ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-orange-700 text-sm">
              You have {stats!.pendingCredits} days to redeem!
            </div>
            <div className="text-orange-500 text-xs mt-0.5">Extend your premium access now</div>
          </div>
          <button
            onClick={() => redeemMutation.mutate()}
            disabled={redeemMutation.isPending}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {redeemMutation.isPending ? "Redeeming..." : "Redeem"}
          </button>
        </div>
      )}

      {/* Apply a code */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">Have a referral code?</h3>
          <button
            onClick={() => setShowApply(p => !p)}
            className="text-blue-600 text-xs hover:underline"
          >
            {showApply ? "Cancel" : "Apply code"}
          </button>
        </div>
        {showApply && (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest"
              placeholder="Enter code (e.g. AB12CD34)"
              maxLength={8}
              value={applyCode}
              onChange={e => setApplyCode(e.target.value.toUpperCase())}
            />
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyCode.length < 6 || applyMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {applyMutation.isPending ? "..." : "Apply"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
