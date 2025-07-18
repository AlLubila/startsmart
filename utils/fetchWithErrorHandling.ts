// utils/fetchWithErrorHandling.ts
export async function fetchWithErrorHandling<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText || "Une erreur est survenue");
  }
  return res.json();
}
