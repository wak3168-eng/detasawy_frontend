export type DraftPlace = { id?: string; name: string; pending?: boolean };
export type DraftTribe = { id?: string; name: string; pending?: boolean };

export type ProfileDraft = {
  name?: string;
  country?: DraftPlace;
  /** Diaspora: the country lived in now. */
  residence?: DraftPlace;
  /** Diaspora: the country the family comes from. */
  origin?: DraftPlace;
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
const CHANGE_EVENT = "detasawy:draft-changed";

function notifyChange() {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // no window (SSR) — nothing to notify
  }
}

export function subscribeDraft(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

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
  notifyChange();
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  notifyChange();
}
