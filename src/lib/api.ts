import { API_BASE } from "@/lib/apiBase";
import { clearAuth, setAuth, type AuthUser } from "@/lib/auth";
import type { ProfileDraft } from "@/lib/profileDraft";
import { draftToPayload, type ServerProfile } from "@/lib/profileSync";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export type Session = {
  csrfToken: string;
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

let csrfToken: string | undefined;
let csrfPending: Promise<string> | undefined;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPending) {
    csrfPending = fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: "same-origin", cache: "no-store",
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || typeof data.csrfToken !== "string") {
        throw new ApiError("Unable to start a secure session. Please try again.", response.status);
      }
      csrfToken = data.csrfToken;
      return data.csrfToken as string;
    }).finally(() => { csrfPending = undefined; });
  }
  return csrfPending;
}

async function apiFetch(path: string, options: RequestInit = {}, retryCsrf = true): Promise<Response> {
  const headers = new Headers(options.headers);
  const method = (options.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-CSRFToken", await getCsrfToken());
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options, credentials: "same-origin", cache: "no-store", headers,
  });
  if (response.status === 401) clearAuth();
  // Another tab may have logged in and rotated the CSRF cookie. Only retry a
  // request explicitly rejected by CSRF validation, before its handler ran.
  if (response.status === 403 && retryCsrf) {
    const data = await response.clone().json().catch(() => null);
    if (typeof data?.detail === "string" && data.detail.startsWith("CSRF Failed:")) {
      csrfToken = undefined;
      return apiFetch(path, options, false);
    }
  }
  return response;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  _authed = false,
): Promise<T> {
  // Retain the legacy call signature; cookies authenticate every request.
  void _authed;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const response = await apiFetch(path, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(extractError(data, response.status), response.status);
  if (data === null) throw new ApiError("The server returned an invalid response. Please try again.");
  return data as T;
}

export async function login(email: string, password: string): Promise<Session> {
  const session = await request<Session>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  csrfToken = session.csrfToken;
  setAuth(session.user);
  return session;
}

export async function logout(): Promise<void> {
  // Do not claim logout succeeded if the server could not revoke the session.
  await request("/api/auth/logout", { method: "POST" });
  csrfToken = undefined;
  clearAuth();
}

export async function getMe(): Promise<{ user: AuthUser; profile: ServerProfile }> {
  const session = await request<{ user: AuthUser; profile: ServerProfile }>("/api/auth/me");
  setAuth(session.user);
  return session;
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
  mergeIntoId?: string | null;
  mergeIntoName?: string | null;
  /** Already published and in use — review is clean-up, not a gate. */
  live?: boolean;
};

export function getOverview(): Promise<OverviewStats> {
  return request("/api/admin/overview", {}, true);
}

export function getSuggestions(status = "review"): Promise<StaffSuggestion[]> {
  return request(`/api/admin/suggestions?status=${status}`, {}, true);
}

export function actOnSuggestion(
  id: number,
  action: "approve" | "keep" | "reject" | "merge",
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

export type CreatedUser = AdminUser & {
  startingPassword: string;
  passwordGenerated: boolean;
};

export function createUser(input: {
  name: string;
  email: string;
  password?: string;
}): Promise<CreatedUser> {
  return request(
    "/api/admin/users/create",
    { method: "POST", body: JSON.stringify(input) },
    true,
  );
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
  kind: "picture" | "scene" | "voice";
  mediaUrl: string;
  captionEn?: string;
  captionPs?: string;
  active: boolean;
  servedCount: number;
  licence?: string;
  sourceUrl?: string;
  answers?: number;
  createdAt: string;
};

export type DatasetItem = {
  id: number;
  kind: "picture" | "scene" | "voice";
  caption: string;
  mediaUrl: string;
  answers: number;
  voices: number;
  words: WordGroup[];
  representative: RepresentativeWord | null;
};

export type RepresentativeWord = {
  word: string;
  count: number;
  sampleSize: number;
  share: number;
  margin: number;
  confidenceLower: number;
  status: "representative" | "mixed" | "insufficient";
};

export type DatasetGroup = {
  key: string;
  label: string;
  responses: number;
  voices: number;
  pictures: number;
};

export type DatasetGrouping =
  | "all"
  | "country"
  | "province"
  | "district"
  | "tehsil"
  | "tribe"
  | "clan"
  | "subclan";

export type DatasetResponse = {
  total: number;
  items: DatasetItem[];
  summary: {
    pictures: number;
    answeredPictures: number;
    responses: number;
    voices: number;
  };
  grouping: {
    by: DatasetGrouping;
    selectedKey: string | null;
    selectedLabel: string | null;
    groups: DatasetGroup[];
  };
  representativeRules: {
    minimumSample: number;
    minimumShare: number;
    minimumMargin: number;
  };
};

export function getDataset(opts: {
  q?: string;
  all?: boolean;
  limit?: number;
  offset?: number;
  groupBy?: DatasetGrouping;
  group?: string;
  minSample?: number;
}): Promise<DatasetResponse> {
  const params = new URLSearchParams();
  if (opts.q) params.set("q", opts.q);
  if (opts.all) params.set("all", "1");
  if (opts.groupBy) params.set("groupBy", opts.groupBy);
  if (opts.group) params.set("group", opts.group);
  params.set("minSample", String(opts.minSample ?? 10));
  params.set("limit", String(opts.limit ?? 20));
  params.set("offset", String(opts.offset ?? 0));
  return request(`/api/admin/dataset?${params}`, {}, true);
}

export function getStaffPrompts(): Promise<StaffPrompt[]> {
  return request("/api/admin/prompts", {}, true);
}

export function uploadPrompt(input: {
  kind: "picture" | "scene" | "voice";
  media: File;
  sourceUrl?: string;
  licence?: string;
  captionEn?: string;
  captionPs?: string;
}): Promise<StaffPrompt> {
  const form = new FormData();
  form.append("kind", input.kind);
  form.append("media", input.media);
  if (input.sourceUrl) form.append("sourceUrl", input.sourceUrl);
  if (input.licence) form.append("licence", input.licence);
  if (input.captionEn) form.append("captionEn", input.captionEn);
  if (input.captionPs) form.append("captionPs", input.captionPs);
  return apiFetch("/api/admin/prompts", {
    method: "POST",
    body: form,
  }).then(async (res) => {
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(extractError(data, res.status), res.status);
    return data as StaffPrompt;
  });
}

export function linkPrompt(input: {
  kind: "picture" | "scene" | "voice";
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

export type BatchUploadResult = {
  created: StaffPrompt[];
  createdCount: number;
  skipped: string[];
  failed: { name: string; why: string }[];
};

/** Upload a whole folder: each file's name becomes its caption. */
export function uploadPromptFolder(
  kind: "picture" | "scene" | "voice",
  files: File[],
): Promise<BatchUploadResult> {
  const form = new FormData();
  form.append("kind", kind);
  for (const file of files) form.append("media", file);
  return apiFetch("/api/admin/prompts/batch", {
    method: "POST",
    body: form,
  }).then(async (res) => {
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(extractError(data, res.status), res.status);
    return data as BatchUploadResult;
  });
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
  kind: "picture" | "scene" | "voice";
  mediaUrl: string;
  captionEn?: string;
  captionPs?: string;
  sourceUrl?: string;
  licence?: string;
};

export function getPrompts(
  kind: "picture" | "scene" | "voice",
  count = 5,
): Promise<PromptItem[]> {
  return request(`/api/prompts?kind=${kind}&count=${count}`, {}, true);
}

export function submitContribution(
  promptId: number,
  text: string,
  audio?: Blob | null,
): Promise<{ id: number; todayCount: number }> {
  const form = new FormData();
  form.append("prompt", String(promptId));
  form.append("text", text);
  if (audio) {
    const ext = audio.type.includes("mp4") ? "mp4" : "webm";
    form.append("audio", audio, `voice.${ext}`);
  }
  return apiFetch("/api/contributions", {
    method: "POST",
    body: form,
  }).then(async (res) => {
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(extractError(data, res.status), res.status);
    return data as { id: number; todayCount: number };
  });
}

export type WordRow = {
  district: string;
  tribe: string;
  clan?: string;
  /** How many people from here gave this word. */
  count: number;
  /** How many of them recorded it aloud. */
  voices?: number;
};

export type WordGroup = {
  word: string;
  count: number;
  share: number;
  /** Other spellings people used for this same word. */
  variants?: { word: string; count: number }[];
  /** Recordings across every place that gave this word. */
  voices?: number;
  rows: WordRow[];
};

export function getPromptWords(promptId: number): Promise<WordGroup[]> {
  return request(`/api/prompts/${promptId}/words`);
}

export function getTodayCount(): Promise<{ count: number }> {
  return request("/api/contributions/today", {}, true);
}

export function uploadProfilePhoto(dataUrl: string): Promise<ServerProfile> {
  return fetch(dataUrl)
    .then((r) => r.blob())
    .then((blob) => {
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      return apiFetch("/api/profile/photo", {
        method: "POST",
        body: form,
      });
    })
    .then(async (res) => {
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) throw new ApiError(extractError(data, res.status), res.status);
      return data as ServerProfile;
    });
}

export type MyStats = {
  points: number;
  wordsAccepted: number;
  todayCount: number;
  streak: number;
  overallRank: number | null;
  districtRank: number | null;
};

export function getMyStats(): Promise<MyStats> {
  return request("/api/me/stats", {}, true);
}

export function saveProfile(draft: ProfileDraft): Promise<ServerProfile> {
  return request(
    "/api/profile",
    { method: "PUT", body: JSON.stringify(draftToPayload(draft)) },
    true,
  );
}
