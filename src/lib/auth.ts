export const AUTH_KEY = "kiddoz_auth";
export const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD ?? "raz";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function authenticate(password: string): boolean {
  if (password === PASSWORD) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}
