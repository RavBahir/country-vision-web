// lib/token-storage.ts
const KEY = "cv_access_token";
const isBrowser = typeof window !== "undefined";

export const tokenStorage = {
  get(): string | null {
    if (!isBrowser) return null;
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set(token: string) {
    if (!isBrowser) return;
    try { localStorage.setItem(KEY, token); } catch {}
  },
  clear() {
    if (!isBrowser) return;
    try { localStorage.removeItem(KEY); } catch {}
  },
};