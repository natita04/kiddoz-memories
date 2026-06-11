export const AUTH_KEY = "kiddoz_auth";
export const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD ?? "razfam";

export type AuthMode = "full" | "guest" | null;

export function getAuthMode(): AuthMode {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(AUTH_KEY);
  if (val === "full") return "full";
  if (val === "guest") return "guest";
  return null;
}

export function isAuthenticated(): boolean {
  const mode = getAuthMode();
  return mode === "full" || mode === "guest";
}

export function authenticate(password: string): boolean {
  if (password === PASSWORD) {
    localStorage.setItem(AUTH_KEY, "full");
    return true;
  }
  return false;
}

export function enterAsGuest(): void {
  localStorage.setItem(AUTH_KEY, "guest");
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
