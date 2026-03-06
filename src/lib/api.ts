import { getAccessToken, setAccessToken, clearAuth } from "./store/auth";

const BASE = "/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Try to refresh on 401
  if (res.status === 401 && retry) {
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshData = (await refreshRes.json()) as ApiResponse<{ accessToken: string }>;
      setAccessToken(refreshData.data.accessToken);
      headers["Authorization"] = `Bearer ${refreshData.data.accessToken}`;
      res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: "include" });
    } else {
      clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error((json as { message?: string }).message || "Something went wrong");
  }

  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
