// // lib/token-storage.ts
// const KEY = "cv_access_token";
// const isBrowser = typeof window !== "undefined";

// export const tokenStorage = {
//   get(): string | null {
//     if (!isBrowser) return null;
//     try { return localStorage.getItem(KEY); } catch { return null; }
//   },
//   set(token: string) {
//     if (!isBrowser) return;
//     try { localStorage.setItem(KEY, token); } catch {}
//   },
//   clear() {
//     if (!isBrowser) return;
//     try { localStorage.removeItem(KEY); } catch {}
//   },
// };

// lib/token-storage.ts
import { useSyncExternalStore } from "react";

const KEY = "cv_access_token";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  /** remember=true -> survives browser restarts; false -> this tab session only */
  set(token: string, remember = true) {
    try {
      const keep = remember ? localStorage : sessionStorage;
      const drop = remember ? sessionStorage : localStorage;
      keep.setItem(KEY, token);
      drop.removeItem(KEY);
    } catch {}
    emit();
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {}
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    window.addEventListener("storage", cb); // logout/login in another tab
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", cb);
    };
  },
};

export const useToken = () =>
  useSyncExternalStore(tokenStorage.subscribe, tokenStorage.get, () => null);

/** false on the server and first client render, true afterwards (no hydration mismatch) */
export const useHydrated = () =>
  useSyncExternalStore(() => () => {}, () => true, () => false);