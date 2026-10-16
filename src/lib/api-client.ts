import { tokenStorage } from "./token-storage";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not configured");
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers, ...config } = options;

const token = tokenStorage.get();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...config,
    headers: {
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ?? `Request failed (${response.status})`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (response.status === 401) {
  tokenStorage.clear();
  if (typeof window !== "undefined") window.location.replace("/login");
}

  return (await response.json()) as T;
}