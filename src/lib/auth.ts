export type Role = "superadmin" | "reviewer" | "campaign" | "contributor";
export type AuthUser = { name: string; email: string; role?: Role };

const USER_KEY = "detasawy:user";
const SESSION_HINT = "detasawy:session-hint";
let currentUser: AuthUser | null = null;

// Display hints only. Backend permissions and /api/auth/me authorize access.
// The session credential is an HttpOnly cookie.
export function hasSessionHint(): boolean {
  try {
    localStorage.removeItem("detasawy:token");
    return currentUser !== null || localStorage.getItem(SESSION_HINT) === "1";
  } catch {
    return currentUser !== null;
  }
}

export function getUser(): AuthUser | null {
  if (currentUser) return currentUser;
  try {
    if (!hasSessionHint()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  currentUser = user;
  try {
    localStorage.removeItem("detasawy:token");
    localStorage.setItem(SESSION_HINT, "1");
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Display state remains available in memory.
  }
}

export function clearAuth() {
  currentUser = null;
  try {
    localStorage.removeItem("detasawy:token");
    localStorage.removeItem(SESSION_HINT);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Storage may be unavailable.
  }
}
