const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export interface ApiError extends Error {
  status: number
  body: unknown
}

function makeApiError(status: number, body: unknown): ApiError {
  const err = new Error(`API error ${status}`) as ApiError
  err.status = status
  err.body = body
  return err
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (!headers.has('X-Timezone')) {
    headers.set('X-Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone)
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw makeApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function apiFetchAuthenticated<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { useAuthStore } = await import('@isle/shared')
  const token = useAuthStore.getState().accessToken
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return apiFetch<T>(endpoint, { ...options, headers })
}
