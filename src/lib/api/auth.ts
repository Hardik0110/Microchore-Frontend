import type { User } from '../../types'
import { apiFetch, getRefreshToken, setTokens } from './client'

type AuthResponse = { access: string; refresh: string; user: User }

export async function apiSignup(payload: {
  email: string
  password: string
  handle?: string
  country?: string
}): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/signup/', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  })
  setTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/token/', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  })
  setTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function apiGoogleSignIn(credential: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/google/', {
    method: 'POST',
    body: { credential },
    skipAuth: true,
  })
  setTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function apiMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me/')
}

export async function apiPatchMe(patch: Partial<User>): Promise<User> {
  return apiFetch<User>('/api/auth/me/', { method: 'PATCH', body: patch })
}

export async function apiLogout(): Promise<void> {
  const refresh = getRefreshToken()
  if (!refresh) return
  try {
    await apiFetch('/api/auth/logout/', {
      method: 'POST',
      body: { refresh },
      skipAuth: true,
    })
  } catch {
    void 0
  }
}

export async function apiRequestEmailVerify(): Promise<void> {
  await apiFetch('/api/auth/email/verify/request/', { method: 'POST', body: {} })
}

export async function apiConfirmEmailVerify(code: string): Promise<User> {
  return apiFetch<User>('/api/auth/email/verify/confirm/', { method: 'POST', body: { code } })
}
