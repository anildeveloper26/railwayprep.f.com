import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { commentsApi } from "@/lib/api";
import { useQuery as useAuthQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  isPinned: boolean;
  upvoteCount: number;
  downvoteCount: number;
  userId: { _id: string; name: string };
  replies: Array<{ _id: string; text: string; createdAt: string; userId: { _id: string; name: string }; upvoteCount: number }>;
};

export function DiscussionForum({ questionId }: { questionId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: apiUser } = useAuthQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const me = apiUser ? adaptUser(apiUser) : null;

  const { data, isLoading } = useQuery({
    queryKey: ["comments", questionId],
    queryFn: () => commentsApi.list(questionId),
    enabled: open,
  });

  const comments: Comment[] = (data?.comments ?? []) as Comment[];

  const postMutation = useMutation({
    mutationFn: (payload: { text: string; parentId?: string }) =>
      commentsApi.create({ questionId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", questionId] });
      setText("");
      setReplyTo(null);
      setReplyText("");
    },
    onError: () => toast.error("Failed to post comment"),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "up" | "down" }) =>
      commentsApi.vote(id, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", questionId] }),
  });

  const totalCount = comments.reduce((s, c) => s + 1 + c.replies.length, 0);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <MessageCircle size={14} />
        {totalCount > 0 ? `${totalCount} comment${totalCount > 1 ? "s" : ""}` : "Discuss"}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Post comment */}
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {me?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment or explanation..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
                rows={2}
              />
              {text.trim() && (
                <button
                  onClick={() => postMutation.mutate({ text })}
                  disabled={postMutation.isPending}
                  className="mt-1 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  {postMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Post
                </button>
              )}
            </div>
          </div>

          {/* Comments */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-blue-500" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c._id} className={cn("bg-gray-50 rounded-xl p-3", c.isPinned && "border border-blue-200 bg-blue-50/40")}>
                  {c.isPinned && (
                    <div className="text-[10px] text-blue-600 font-semibold mb-1 uppercase tracking-wide">📌 Pinned</div>
                  )}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0">
                      {c.userId.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700">{c.userId.name}</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          onClick={() => voteMutation.mutate({ id: c._id, type: "up" })}
                          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition"
                        >
                          <ThumbsUp size={11} /> {c.upvoteCount}
                        </button>
                        <button
                          onClick={() => voteMutation.mutate({ id: c._id, type: "down" })}
                          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition"
                        >
                          <ThumbsDown size={11} /> {c.downvoteCount}
                        </button>
                        <button
                          onClick={() => setReplyTo(replyTo?.id === c._id ? null : { id: c._id, name: c.userId.name })}
                          className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition"
                        >
                          <Reply size={11} /> Reply
                        </button>
                      </div>

                      {/* Reply input */}
                      {replyTo?.id === c._id && (
                        <div className="mt-2 flex gap-2">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Reply to ${replyTo.name}...`}
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:border-blue-400"
                            rows={2}
                          />
                          <button
                            onClick={() => postMutation.mutate({ text: replyText, parentId: c._id })}
                            disabled={!replyText.trim() || postMutation.isPending}
                            className="self-end bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                          >
                            <Send size={11} />
                          </button>
                        </div>
                      )}

                      {/* Replies */}
                      {c.replies.length > 0 && (
                        <div className="mt-2 space-y-2 pl-3 border-l-2 border-gray-200">
                          {c.replies.map(r => (
                            <div key={r._id} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[9px] font-bold shrink-0">
                                {r.userId.name[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-semibold text-gray-700">{r.userId.name}</span>
                                  <span className="text-[10px] text-gray-400">{timeAgo(r.createdAt)}</span>
                                </div>
                                <p className="text-xs text-gray-600">{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
