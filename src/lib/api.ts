export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

const ACCESS_KEY = 'microchore:access'
const REFRESH_KEY = 'microchore:refresh'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: { access?: string; refresh?: string }) {
  if (typeof window === 'undefined') return
  if (tokens.access) window.localStorage.setItem(ACCESS_KEY, tokens.access)
  if (tokens.refresh) window.localStorage.setItem(REFRESH_KEY, tokens.refresh)
}

export function clearTokens() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  status: number
  detail: string
  payload: unknown

  constructor(status: number, detail: string, payload: unknown) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.payload = payload
  }
}

type InflightListener = () => void
let inflightCount = 0
const inflightListeners = new Set<InflightListener>()

export function getApiInflightCount(): number {
  return inflightCount
}

export function subscribeApiInflight(listener: InflightListener): () => void {
  inflightListeners.add(listener)
  return () => {
    inflightListeners.delete(listener)
  }
}

function notifyInflight() {
  for (const l of inflightListeners) l()
}

function startInflight() {
  inflightCount += 1
  notifyInflight()
}

function endInflight() {
  inflightCount = Math.max(0, inflightCount - 1)
  notifyInflight()
}

type FetchOpts = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
  isRetry?: boolean
}

function extractDetail(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const p = payload as Record<string, unknown>
  const detail = p.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length && typeof detail[0] === 'string') return detail[0] as string
  for (const v of Object.values(p)) {
    if (typeof v === 'string') return v
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0] as string
  }
  return fallback
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access?: string; refresh?: string }
    if (data.access) setTokens({ access: data.access, refresh: data.refresh })
    return data.access ?? null
  } catch {
    return null
  }
}

export async function apiFetch<T = unknown>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { body, skipAuth, isRetry, headers, ...rest } = opts
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  }
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  startInflight()
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    })

    if (res.status === 204) return undefined as T

    let payload: unknown = null
    const text = await res.text()
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = text
      }
    }

    if (res.status === 401 && !skipAuth && !isRetry) {
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        return apiFetch<T>(path, { ...opts, isRetry: true })
      }
      clearTokens()
      throw new ApiError(401, 'Session expired. Please sign in again.', payload)
    }

    if (!res.ok) {
      throw new ApiError(res.status, extractDetail(payload, res.statusText || 'Request failed'), payload)
    }

    return payload as T
  } finally {
    endInflight()
  }
}

import type { User } from './auth'

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

import type { LinkedAccount } from './auth'

export async function apiLinkYouTube(accessToken: string): Promise<{ linkedAccount: LinkedAccount }> {
  return apiFetch<{ linkedAccount: LinkedAccount }>('/api/auth/social/youtube/', {
    method: 'POST',
    body: { access_token: accessToken },
  })
}

export async function apiTwitterStartLink(): Promise<{ authorize_url: string }> {
  return apiFetch<{ authorize_url: string }>('/api/auth/social/twitter/start/', {
    method: 'POST',
  })
}

export async function apiMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me/')
}

export async function apiPatchMe(patch: Partial<User>): Promise<User> {
  return apiFetch<User>('/api/auth/me/', { method: 'PATCH', body: patch })
}

import type { Submission, Task, EarningsSummary, SubmissionCreatePayload } from './store'

export async function apiGetTasks(): Promise<Task[]> {
  const data = await apiFetch<Task[] | { results: Task[] }>('/api/tasks/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function apiGetTask(id: string | number): Promise<Task | null> {
  try {
    return await apiFetch<Task>(`/api/tasks/${id}/`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function apiGetMySubmissions(): Promise<Submission[]> {
  const data = await apiFetch<Submission[] | { results: Submission[] }>('/api/submissions/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function apiCreateSubmission(payload: SubmissionCreatePayload): Promise<Submission> {
  return apiFetch<Submission>('/api/submissions/', {
    method: 'POST',
    body: payload,
  })
}

export async function apiReviewSubmission(
  id: string,
  decision: 'approved' | 'rejected',
  rating: 1 | 2 | 3 | 4 | 5,
  justification: string,
): Promise<Submission> {
  return apiFetch<Submission>(`/api/submissions/${id}/review/`, {
    method: 'POST',
    body: { decision, rating, justification },
  })
}

export async function apiGetMyEarnings(): Promise<EarningsSummary> {
  return apiFetch<EarningsSummary>('/api/earnings/')
}

export type Claim = {
  id: number
  taskId: number
  userId: number
  claimedAt: string
  expiresAt: string
  status: string
}

export async function apiClaimTask(taskId: string | number): Promise<Claim> {
  return apiFetch<Claim>(`/api/tasks/${taskId}/claim/`, { method: 'POST' })
}

export type ReviewerQueueItem = {
  id: string
  taskId: string
  taskTitle: string
  taskTone: string
  targetUrl: string
  keyword: string
  text: string
  commentUrl: string
  commentAccountHandle: string
  elapsedSec: number
  pasteCount: number
  pastedChars: number
  charsTyped: number
  submittedAt: string
  reviewCount: number
}

export async function apiGetReviewerQueue(limit = 20): Promise<ReviewerQueueItem[]> {
  return apiFetch<ReviewerQueueItem[]>(`/api/reviews/queue/?limit=${limit}`)
}

export type ReviewCreatePayload = {
  rating: 1 | 2 | 3 | 4 | 5
  justification_text: string
  feels_ai_flag: boolean
  time_taken_seconds: number
}

export async function apiCreateReview(
  submissionId: string | number,
  payload: ReviewCreatePayload,
): Promise<Submission> {
  return apiFetch<Submission>(`/api/reviews/submissions/${submissionId}/`, {
    method: 'POST',
    body: payload,
  })
}
