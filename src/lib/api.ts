import { API_BASE } from "@/lib/apiBase";
import { clearAuth, getToken, setAuth, type AuthUser } from "@/lib/auth";
import type { ProfileDraft } from "@/lib/profileDraft";
import { draftToPayload, type ServerProfile } from "@/lib/profileSync";

export class ApiError extends Error {}

export type Session = {
  token: string;
  user: AuthUser;
  profile: ServerProfile;
};

function extractError(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (typeof record.detail === "string") return record.detail;
    for (const [key, value] of Object.entries(record)) {
      const first = Array.isArray(value) ? value[0] : value;
      if (typeof first === "string") {
        return key === "non_field_errors" ? first : `${key}: ${first}`;
      }
    }
  }
  if (status === 429) return "Too many attempts — try again in a minute.";
  return "Something went wrong. Please try again.";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authed = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authed) {
    const token = getToken();
    if (!token) throw new ApiError("Not logged in.");
    headers.Authorization = `Token ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(extractError(data, response.status));
  return data as T;
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Session> {
  const session = await request<Session>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ ...input, consent: true }),
  });
  setAuth(session.token, session.user);
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  const session = await request<Session>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuth(session.token, session.user);
  return session;
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", { method: "POST" }, true);
  } catch {
    // token already invalid — clearing locally is what matters
  } finally {
    clearAuth();
  }
}

export function getMe(): Promise<{ user: AuthUser; profile: ServerProfile }> {
  return request("/api/auth/me", {}, true);
}

export function saveProfile(draft: ProfileDraft): Promise<ServerProfile> {
  return request(
    "/api/profile",
    { method: "PUT", body: JSON.stringify(draftToPayload(draft)) },
    true,
  );
}
