import Cookies from "js-cookie";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = Cookies.get("rrb_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return (json.data ?? json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
