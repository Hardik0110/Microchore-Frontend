import { ACCESS_KEY, REFRESH_KEY } from '../../constants/storage'

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

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

export type FetchOpts = Omit<RequestInit, 'body'> & {
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

let refreshPromise: Promise<string | null> | null = null

async function performRefresh(refresh: string): Promise<string | null> {
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

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  const refresh = getRefreshToken()
  if (!refresh) return null
  refreshPromise = performRefresh(refresh).finally(() => {
    refreshPromise = null
  })
  return refreshPromise
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
