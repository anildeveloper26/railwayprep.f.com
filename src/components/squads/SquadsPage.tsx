import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trophy, MessageCircle, LogOut, Send, Loader2, Crown, Copy, CheckCircle2 } from "lucide-react";
import { squadsApi, type ApiSquad } from "@/lib/api";
import { authApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "overview" | "chat" | "leaderboard";

export function SquadsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ApiSquad | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", targetExam: "RRB NTPC" });
  const [joinCode, setJoinCode] = useState("");
  const [msgText, setMsgText] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const me = apiUser ? adaptUser(apiUser) : null;

  const { data: squadsData, isLoading } = useQuery({
    queryKey: ["squads"],
    queryFn: squadsApi.mine,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["squad-messages", selected?._id],
    queryFn: () => squadsApi.getMessages(selected!._id),
    enabled: !!selected && tab === "chat",
    refetchInterval: 5000,
  });

  const { data: lbData } = useQuery({
    queryKey: ["squad-leaderboard", selected?._id],
    queryFn: () => squadsApi.leaderboard(selected!._id),
    enabled: !!selected && tab === "leaderboard",
  });

  const createMutation = useMutation({
    mutationFn: squadsApi.create,
    onSuccess: (res) => {
      toast.success("Squad created!");
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      setSelected(res.squad);
      setShowCreate(false);
      setForm({ name: "", description: "", targetExam: "RRB NTPC" });
    },
    onError: () => toast.error("Failed to create squad"),
  });

  const joinMutation = useMutation({
    mutationFn: (code: string) => {
      // find squad by code (backend handles it via the code field)
      return squadsApi.join("code", code);
    },
    onSuccess: (res) => {
      toast.success("Joined squad!");
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      setSelected(res.squad);
      setShowJoin(false);
      setJoinCode("");
    },
    onError: () => toast.error("Invalid invite code or squad full"),
  });

  const leaveMutation = useMutation({
    mutationFn: (id: string) => squadsApi.leave(id),
    onSuccess: () => {
      toast.success("Left squad");
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      setSelected(null);
    },
  });

  const msgMutation = useMutation({
    mutationFn: (text: string) => squadsApi.postMessage(selected!._id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squad-messages", selected?._id] });
      setMsgText("");
    },
    onError: () => toast.error("Failed to send"),
  });

  const squads: ApiSquad[] = (squadsData?.squads ?? []) as ApiSquad[];
  const messages = (messagesData?.messages ?? []) as Array<{ _id: string; text: string; createdAt: string; userId: { _id: string; name: string } }>;
  const leaderboard = (lbData?.leaderboard ?? []) as Array<{ _id: string; name: string; averageScore: number; testsAttempted: number; rank: number }>;

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-blue-600" /> Study Squads
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Study together, compete together</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(p => !p)}
            className="text-sm border border-blue-200 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition">
            Join Squad
          </button>
          <button onClick={() => setShowCreate(p => !p)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Create a Squad</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Squad Name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="RRB Warriors"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Target Exam</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.targetExam} onChange={e => setForm(p => ({ ...p, targetExam: e.target.value }))}>
                {["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Optional..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
            <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700">
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Join form */}
      {showJoin && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Enter Invite Code</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest"
              placeholder="e.g. A1B2C3" maxLength={6} value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())} />
          </div>
          <button onClick={() => joinMutation.mutate(joinCode)} disabled={joinCode.length < 4 || joinMutation.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50">
            {joinMutation.isPending ? "Joining..." : "Join"}
          </button>
          <button onClick={() => setShowJoin(false)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Squad list */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Squads ({squads.length}/3)</h3>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
          ) : squads.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No squads yet. Create or join one!</p>
            </div>
          ) : (
            squads.map(s => (
              <button key={s._id} onClick={() => setSelected(s)}
                className={cn("w-full text-left bg-white rounded-xl border p-3 transition hover:shadow-sm",
                  selected?._id === s._id ? "border-blue-500 shadow-sm" : "border-gray-100")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-800 truncate">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.members.length}/10</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{s.targetExam}</div>
              </button>
            ))
          )}
        </div>

        {/* Squad detail */}
        {selected ? (
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Squad header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{selected.members.length} members · {selected.targetExam}</span>
                  <button onClick={() => copyCode(selected.inviteCode)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                    {copiedCode ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                    {selected.inviteCode}
                  </button>
                </div>
              </div>
              <button onClick={() => leaveMutation.mutate(selected._id)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50">
                <LogOut size={13} /> Leave
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["overview", "chat", "leaderboard"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("flex-1 py-2.5 text-sm font-medium capitalize transition-colors",
                    tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700")}>
                  {t === "chat" ? <span className="flex items-center justify-center gap-1"><MessageCircle size={13} /> Chat</span> :
                   t === "leaderboard" ? <span className="flex items-center justify-center gap-1"><Trophy size={13} /> Ranks</span> :
                   "Members"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4">
              {tab === "overview" && (
                <div className="space-y-2">
                  {(selected.members as Array<{ _id: string; name: string }>).map((m, i) => (
                    <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        i === 0 ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700")}>
                        {m.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-800 flex-1">{m.name}</span>
                      {selected.ownerId._id === m._id && <Crown size={14} className="text-yellow-500" />}
                      {m._id === (apiUser as { _id?: string })?._id && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">You</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "chat" && (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">No messages yet</p>
                    ) : messages.map(msg => (
                      <div key={msg._id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0">
                          {msg.userId.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-700">{msg.userId.name}: </span>
                          <span className="text-sm text-gray-700">{msg.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Type a message..." value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && msgText.trim() && msgMutation.mutate(msgText)} />
                    <button onClick={() => msgMutation.mutate(msgText)} disabled={!msgText.trim() || msgMutation.isPending}
                      className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-blue-700">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}

              {tab === "leaderboard" && (
                <div className="space-y-2">
                  {leaderboard.map((m, i) => (
                    <div key={m._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                        i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : i === 2 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600")}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-800">{m.name}</span>
                      <span className="text-xs text-gray-400">{m.testsAttempted} tests</span>
                      <span className="text-sm font-bold text-blue-600">{m.averageScore}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a squad to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
