const ACCESS_TOKEN_KEY = "rrb_access_token";
const USER_KEY = "rrb_user";

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  category: "General" | "OBC" | "SC" | "ST" | "EWS";
  targetExam: string;
  subscriptionPlan: "free" | "monthly" | "quarterly" | "annual";
  testsAttempted: number;
  averageScore: number;
  totalPoints: number;
  avatar?: string;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
