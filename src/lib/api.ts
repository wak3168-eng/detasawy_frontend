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

export type OverviewStats = {
  uniqueWords: number;
  pictures: number;
  picturesActive: number;
  picturesAnswered: number;
  contributions: number;
  contributionsToday: number;
  contributionsWeek: number;
  voiceNotes: number;
  users: number;
  profilesCompleted: number;
  contributors: number;
  districtsCovered: number;
  campaignsLive: number;
  suggestionsPending: number;
  tribes: number;
  languages: number;
};

export type StaffSuggestion = {
  id: number;
  kind: string;
  name: string;
  parentId?: string;
  parentName?: string;
  timesSuggested: number;
  suggestedBy?: string;
  status: string;
  candidates: { id: string; name: string }[];
};

export function getOverview(): Promise<OverviewStats> {
  return request("/api/admin/overview", {}, true);
}

export function getSuggestions(status = "pending"): Promise<StaffSuggestion[]> {
  return request(`/api/admin/suggestions?status=${status}`, {}, true);
}

export function actOnSuggestion(
  id: number,
  action: "approve" | "reject" | "merge",
  mergeIntoId?: string,
): Promise<StaffSuggestion> {
  return request(
    `/api/admin/suggestions/${id}`,
    { method: "POST", body: JSON.stringify({ action, mergeIntoId }) },
    true,
  );
}

export type CampaignItem = {
  id: number;
  name: string;
  description?: string;
  scopeType: string;
  scopeName?: string;
  startsAt: string;
  endsAt: string;
};

export function getCampaigns(): Promise<CampaignItem[]> {
  return request("/api/campaigns");
}

export type AdminUser = {
  name: string;
  email: string;
  role: "superadmin" | "reviewer" | "campaign" | "contributor";
  joined: string;
  profileComplete: boolean;
};

export function searchUsers(q: string): Promise<AdminUser[]> {
  return request(`/api/admin/users?q=${encodeURIComponent(q)}`, {}, true);
}

export function setUserRole(
  email: string,
  role: "reviewer" | "campaign" | "contributor",
): Promise<AdminUser> {
  return request(
    "/api/admin/users/role",
    { method: "POST", body: JSON.stringify({ email, role }) },
    true,
  );
}

export type StaffPrompt = {
  id: number;
  kind: "picture" | "voice";
  mediaUrl: string;
  captionEn?: string;
  captionPs?: string;
  active: boolean;
  servedCount: number;
  licence?: string;
  createdAt: string;
};

export function getStaffPrompts(): Promise<StaffPrompt[]> {
  return request("/api/admin/prompts", {}, true);
}

export function uploadPrompt(input: {
  kind: "picture" | "voice";
  media: File;
  captionEn?: string;
  captionPs?: string;
}): Promise<StaffPrompt> {
  const token = getToken();
  if (!token) return Promise.reject(new ApiError("Not logged in."));
  const form = new FormData();
  form.append("kind", input.kind);
  form.append("media", input.media);
  if (input.captionEn) form.append("captionEn", input.captionEn);
  if (input.captionPs) form.append("captionPs", input.captionPs);
  return fetch(`${API_BASE}/api/admin/prompts`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: form,
  }).then(async (res) => {
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(extractError(data, res.status));
    return data as StaffPrompt;
  });
}

export function linkPrompt(input: {
  kind: "picture" | "voice";
  mediaUrl: string;
  sourceUrl?: string;
  licence?: string;
  captionEn?: string;
  captionPs?: string;
}): Promise<StaffPrompt> {
  return request(
    "/api/admin/prompts",
    { method: "POST", body: JSON.stringify(input) },
    true,
  );
}

export function setPromptActive(
  id: number,
  active: boolean,
): Promise<StaffPrompt> {
  return request(
    `/api/admin/prompts/${id}`,
    { method: "POST", body: JSON.stringify({ active }) },
    true,
  );
}

export type StaffCampaign = CampaignItem & {
  status: "live" | "upcoming" | "ended";
};

export function getStaffCampaigns(): Promise<StaffCampaign[]> {
  return request("/api/admin/campaigns", {}, true);
}

export function createCampaign(input: {
  name: string;
  description?: string;
  scopeType: "all" | "district" | "province";
  scopeId?: string;
  scopeName?: string;
  startsAt: string;
  endsAt: string;
}): Promise<StaffCampaign> {
  return request(
    "/api/admin/campaigns",
    { method: "POST", body: JSON.stringify(input) },
    true,
  );
}

export function endCampaign(id: number): Promise<StaffCampaign> {
  return request(`/api/admin/campaigns/${id}/end`, { method: "POST" }, true);
}

export type PromptItem = {
  id: number;
  kind: "picture" | "voice";
  mediaUrl: string;
  captionEn?: string;
  captionPs?: string;
  sourceUrl?: string;
  licence?: string;
};

export function getPrompts(
  kind: "picture" | "voice",
  count = 5,
): Promise<PromptItem[]> {
  return request(`/api/prompts?kind=${kind}&count=${count}`, {}, true);
}

export function submitContribution(
  promptId: number,
  text: string,
  audio?: Blob | null,
): Promise<{ id: number; todayCount: number }> {
  const token = getToken();
  if (!token) return Promise.reject(new ApiError("Not logged in."));
  const form = new FormData();
  form.append("prompt", String(promptId));
  form.append("text", text);
  if (audio) {
    const ext = audio.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", audio, `voice.${ext}`);
  }
  return fetch(`${API_BASE}/api/contributions`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: form,
  }).then(async (res) => {
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(extractError(data, res.status));
    return data as { id: number; todayCount: number };
  });
}

export type WordRow = {
  district: string;
  tribe: string;
  clan?: string;
  count: number;
};

export type WordGroup = { word: string; count: number; rows: WordRow[] };

export function getPromptWords(promptId: number): Promise<WordGroup[]> {
  return request(`/api/prompts/${promptId}/words`);
}

export function getTodayCount(): Promise<{ count: number }> {
  return request("/api/contributions/today", {}, true);
}

export function saveProfile(draft: ProfileDraft): Promise<ServerProfile> {
  return request(
    "/api/profile",
    { method: "PUT", body: JSON.stringify(draftToPayload(draft)) },
    true,
  );
}
