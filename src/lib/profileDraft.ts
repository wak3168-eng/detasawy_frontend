export type DraftPlace = { id?: string; name: string; pending?: boolean };
export type DraftTribe = { id?: string; name: string; pending?: boolean };

export type ProfileDraft = {
  name?: string;
  country?: DraftPlace;
  province?: DraftPlace;
  district?: DraftPlace;
  tehsil?: DraftPlace;
  city?: string;
  tribePath?: DraftTribe[];
  language?: string;
  photo?: string;
  completedAt?: string;
};

const KEY = "detasawy:profile-draft";

export function loadDraft(): ProfileDraft {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProfileDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraft(draft: ProfileDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable — the wizard still works for the session
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
