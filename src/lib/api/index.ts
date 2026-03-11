import { api } from "./client";
import type {
  ApiUser, ApiTest, ApiQuestion, ApiAttempt, ApiAnalytics,
  ApiLeaderboardEntry, ApiNotification, ApiSubscriptionPlan,
  ApiPlannerTask, ApiPlannerStats, ApiAdminDashboard, ApiAdminUser,
  ApiPYQTopic,
} from "@/lib/interfaces";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user: ApiUser }>("/auth/login", { email, password }),

  register: (data: { name: string; email: string; password: string; category: string; targetExam: string }) =>
    api.post<{ accessToken: string; user: ApiUser }>("/auth/register", data),

  getMe: () => api.get<ApiUser>("/auth/me"),

  updateProfile: (data: Partial<{ name: string; targetExam: string }>) =>
    api.patch<ApiUser>("/auth/me", data),

  logout: () => api.post<void>("/auth/logout", {}),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

export const testsApi = {
  list: (params?: { exam?: string; difficulty?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.exam) q.set("exam", params.exam);
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.page) q.set("page", String(params.page));
    q.set("limit", String(params?.limit ?? 50));
    return api.get<{ tests: ApiTest[]; total: number } | ApiTest[]>(`/tests?${q}`);
  },

  getById: (id: string) => api.get<ApiTest>(`/tests/${id}`),

  getForReview: (id: string) => api.get<ApiTest>(`/tests/${id}/review`),
};

// ─── Questions ────────────────────────────────────────────────────────────────

export const questionsApi = {
  list: (params?: { subject?: string; difficulty?: string; page?: number; limit?: number; isPYQ?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.subject) q.set("subject", params.subject);
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.page) q.set("page", String(params.page));
    if (params?.isPYQ) q.set("isPYQ", "true");
    q.set("limit", String(params?.limit ?? 20));
    return api.get<{ questions: ApiQuestion[]; total: number } | ApiQuestion[]>(`/questions?${q}`);
  },

  getPYQTopics: () => api.get<ApiPYQTopic[]>("/questions/pyq-topics"),

  getById: (id: string) => api.get<ApiQuestion>(`/questions/${id}`),
};

// ─── Attempts ─────────────────────────────────────────────────────────────────

export const attemptsApi = {
  submit: (testId: string, data: {
    timeTaken: number;
    answers: Array<{ questionId: string; selectedOption: string; timeTaken: number; isFlagged: boolean }>;
  }) => api.post<ApiAttempt>(`/attempts/${testId}/submit`, data),

  getMyAttempts: () => api.get<ApiAttempt[]>("/attempts"),

  getById: (id: string) => api.get<ApiAttempt>(`/attempts/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  getMy: () => api.get<ApiAnalytics>("/analytics"),
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const leaderboardApi = {
  get: () => api.get<ApiLeaderboardEntry[]>("/leaderboard"),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => api.get<ApiNotification[]>("/notifications"),
  getById: (id: string) => api.get<ApiNotification>(`/notifications/${id}`),
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptionsApi = {
  getPlans: () => api.get<ApiSubscriptionPlan[]>("/subscriptions/plans"),

  getMy: () => api.get<{ plan: string; expiresAt: string; isActive: boolean }>("/subscriptions/my"),

  createOrder: (planId: string) => api.post<{ orderId: string; amount: number; currency: string }>("/subscriptions/order", { planId }),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post<{ success: boolean }>("/subscriptions/verify", data),
};

// ─── Planner ──────────────────────────────────────────────────────────────────

export const plannerApi = {
  getTasks: () => api.get<ApiPlannerTask[]>("/planner"),

  getStats: () => api.get<ApiPlannerStats>("/planner/stats"),

  createTask: (data: {
    title: string; subject: string; topic: string;
    priority: string; targetDate: string; estimatedMinutes: number; notes?: string;
  }) => api.post<ApiPlannerTask>("/planner", data),

  updateTask: (id: string, data: Partial<{ priority: string; estimatedMinutes: number; isCompleted: boolean }>) =>
    api.patch<ApiPlannerTask>(`/planner/${id}`, data),

  deleteTask: (id: string) => api.delete<void>(`/planner/${id}`),
};

// ─── Daily Challenge ──────────────────────────────────────────────────────────

export const dailyChallengeApi = {
  get: (exam?: string) => {
    const q = exam ? `?exam=${exam}` : "";
    return api.get<{
      alreadyAttempted: boolean;
      date: string;
      exam: string;
      questions: Array<{ _id: string; questionText: string; options: Array<{ key: string; text: string }>; subject: string; topic: string; difficulty: string }>;
      attempt?: unknown;
      streak: { currentStreak: number; longestStreak: number; totalCompleted: number };
    }>(`/daily-challenge${q}`);
  },

  submit: (data: { exam: string; questionIds: string[]; answers: Array<{ questionId: string; selectedOption: string }> }) =>
    api.post<{ score: number; streak: { currentStreak: number; longestStreak: number } }>("/daily-challenge/submit", data),

  getStreak: () => api.get<{ streak: { currentStreak: number; longestStreak: number; totalCompleted: number; lastCompletedDate: string } }>("/daily-challenge/streak"),
};

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type FlashcardResult = "easy" | "hard" | "again";

export const flashcardsApi = {
  list: (params?: { subject?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.subject && params.subject !== "All") q.set("subject", params.subject);
    if (params?.limit) q.set("limit", String(params.limit));
    return api.get<{
      flashcards: Array<{
        _id: string; subject: string; topic: string; front: string; back: string;
        tags: string[]; isCustom: boolean; isDue: boolean;
        progress: { easeFactor: number; interval: number; repetitions: number; nextReviewDate: string; lastResult: string } | null;
      }>;
    }>(`/flashcards?${q}`);
  },

  review: (id: string, result: FlashcardResult) =>
    api.post<{ progress: unknown }>(`/flashcards/${id}/review`, { result }),

  getProgress: () => api.get<{ progress: Array<{ subject: string; total: number; mastered: number; masteryPercent: number }> }>("/flashcards/progress"),

  createCustom: (data: { subject: string; topic: string; front: string; back: string; tags?: string[] }) =>
    api.post<{ flashcard: unknown }>("/flashcards/custom", data),
};

// ─── Referrals ────────────────────────────────────────────────────────────────

export const referralsApi = {
  getLink: () => api.get<{ referralCode: string; totalReferrals: number; convertedReferrals: number; pendingCredits: number; redeemedCredits: number }>("/referrals/link"),

  getStats: () => api.get<{ referralCode: string; totalReferrals: number; convertedReferrals: number; pendingCredits: number; redeemedCredits: number; referrals: unknown[] }>("/referrals/stats"),

  apply: (referralCode: string) => api.post<{ referral: unknown }>("/referrals/apply", { referralCode }),

  redeem: () => api.post<{ daysRedeemed: number; newExpiryDate: string }>("/referrals/redeem", {}),
};

// ─── Comments (Discussion Forum) ─────────────────────────────────────────────

export const commentsApi = {
  list: (questionId: string) => api.get<{
    comments: Array<{
      _id: string; text: string; createdAt: string; isPinned: boolean;
      upvoteCount: number; downvoteCount: number;
      userId: { _id: string; name: string };
      replies: Array<{ _id: string; text: string; createdAt: string; userId: { _id: string; name: string }; upvoteCount: number }>;
    }>;
  }>(`/comments?questionId=${questionId}`),
  create: (data: { questionId: string; text: string; parentId?: string }) =>
    api.post<{ comment: unknown }>("/comments", data),
  vote: (id: string, type: "up" | "down") =>
    api.post<void>(`/comments/${id}/vote`, { type }),
  delete: (id: string) => api.delete<void>(`/comments/${id}`),
};

// ─── Squads ───────────────────────────────────────────────────────────────────

export type ApiSquad = {
  _id: string; name: string; inviteCode: string; targetExam: string;
  members: Array<{ _id: string; name: string; averageScore?: number; testsAttempted?: number }>;
  ownerId: { _id: string; name: string };
  description?: string;
};

export const squadsApi = {
  mine: () => api.get<{ squads: ApiSquad[] }>("/squads"),
  create: (data: { name: string; description?: string; targetExam?: string }) =>
    api.post<{ squad: ApiSquad }>("/squads", data),
  get: (id: string) => api.get<{ squad: ApiSquad }>(`/squads/${id}`),
  join: (id: string, inviteCode: string) => api.post<{ squad: ApiSquad }>(`/squads/${id}/join`, { inviteCode }),
  joinByCode: (inviteCode: string) => api.post<{ squad: ApiSquad }>(`/squads/code/join`, { inviteCode }),
  leave: (id: string) => api.delete<void>(`/squads/${id}/leave`),
  leaderboard: (id: string) => api.get<{ leaderboard: Array<{ _id: string; name: string; averageScore: number; testsAttempted: number; rank: number }> }>(`/squads/${id}/leaderboard`),
  getMessages: (id: string) => api.get<{ messages: Array<{ _id: string; text: string; createdAt: string; userId: { _id: string; name: string } }> }>(`/squads/${id}/messages`),
  postMessage: (id: string, text: string) => api.post<{ message: unknown }>(`/squads/${id}/messages`, { text }),
};

// ─── Live Events ──────────────────────────────────────────────────────────────

export type ApiEvent = {
  _id: string; title: string; exam: string; scheduledAt: string;
  registrationDeadline: string; durationMinutes: number; status: "upcoming" | "live" | "ended";
  isRegistered: boolean; registeredCount: number;
  testId: { title: string; totalQuestions: number; duration: number };
};

export const eventsApi = {
  list: (status?: string) => {
    const q = status ? `?status=${status}` : "";
    return api.get<{ events: ApiEvent[] }>(`/events${q}`);
  },
  get: (id: string) => api.get<{ event: ApiEvent }>(`/events/${id}`),
  register: (id: string) => api.post<void>(`/events/${id}/register`, {}),
  submit: (id: string, data: { answers: Array<{ questionId: string; selectedOption: string }>; timeTaken: number }) =>
    api.post<{ attempt: unknown }>(`/events/${id}/submit`, data),
  leaderboard: (id: string) => api.get<{ leaderboard: Array<{ rank: number; user: { name: string }; percentage: number; timeTaken: number }> }>(`/events/${id}/leaderboard`),
  create: (data: { title: string; exam: string; testId: string; scheduledAt: string; registrationDeadline: string; durationMinutes: number }) =>
    api.post<{ event: ApiEvent }>("/events", data),
};

// ─── AI ───────────────────────────────────────────────────────────────────────

export const aiApi = {
  generateStudyPlan: (examDate: string) =>
    api.post<{ tasks: unknown[]; daysLeft: number }>("/ai/study-plan", { examDate }),
  extractQuestions: (data: { text: string; subject?: string; exam?: string; year?: number; isPYQ?: boolean }) =>
    api.post<{
      questions: Array<{
        questionText: string; options: Array<{ key: string; text: string }>;
        correctOption: string; explanation: string; topic: string;
        difficulty: string; subject: string; exam: string; confidence: number;
      }>;
      count: number;
    }>("/ai/extract-questions", data),
  approveQuestions: (questions: unknown[]) =>
    api.post<{ saved: number }>("/ai/questions/approve", { questions }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => api.get<ApiAdminDashboard>("/admin/dashboard"),
  getStats: () => api.get<ApiAdminDashboard>("/admin/stats"),
  listUsers: () => api.get<ApiAdminUser[]>("/admin/users"),
  deactivateUser: (userId: string) => api.patch<void>(`/admin/users/${userId}/deactivate`, {}),
};
