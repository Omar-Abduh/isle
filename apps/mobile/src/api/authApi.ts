import { apiFetch } from './client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    displayName?: string
    timezone: string
    pictureUrl?: string
    joinedAt?: string
  }
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<AuthResponse> {
  const json = await apiFetch<{ data: AuthResponse[] }>('/api/v1/auth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code, codeVerifier, redirectUri }),
  })
  return json.data[0]
}

export async function loginDemo(): Promise<AuthResponse> {
  const json = await apiFetch<{ data: AuthResponse[] }>('/api/v1/auth/demo-login', {
    method: 'POST',
  })
  return json.data[0]
}
