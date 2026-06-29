const TOKEN_KEY = 'proftime_auth_token'

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getAuthToken()
  if (!token) return extra
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  }
}
