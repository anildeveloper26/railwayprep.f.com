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

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => api.get<ApiAdminDashboard>("/admin/dashboard"),
  getStats: () => api.get<ApiAdminDashboard>("/admin/stats"),
  listUsers: () => api.get<ApiAdminUser[]>("/admin/users"),
  deactivateUser: (userId: string) => api.patch<void>(`/admin/users/${userId}/deactivate`, {}),
};
