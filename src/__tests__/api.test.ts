import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ApiError,
  apiFetch,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../lib/api'

describe('ApiError', () => {
  it('preserves status, detail, and payload', () => {
    const err = new ApiError(403, 'Forbidden', { reason: 'no_access' })
    expect(err.status).toBe(403)
    expect(err.detail).toBe('Forbidden')
    expect(err.payload).toEqual({ reason: 'no_access' })
    expect(err.name).toBe('ApiError')
    expect(err.message).toBe('Forbidden')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ApiError)
  })
})

describe('token storage helpers', () => {
  beforeEach(() => {
    clearTokens()
  })

  it('setTokens persists access + refresh to localStorage', () => {
    setTokens({ access: 'A', refresh: 'R' })
    expect(getAccessToken()).toBe('A')
    expect(getRefreshToken()).toBe('R')
  })

  it('clearTokens removes both', () => {
    setTokens({ access: 'A', refresh: 'R' })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('setTokens with partial payload only sets what is provided', () => {
    setTokens({ access: 'A1', refresh: 'R1' })
    setTokens({ access: 'A2' })
    expect(getAccessToken()).toBe('A2')
    expect(getRefreshToken()).toBe('R1')
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    clearTokens()
  })

  it('attaches Bearer header when access token is present', async () => {
    setTokens({ access: 'TEST_ACCESS' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiFetch('/some/path')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [, init] = fetchSpy.mock.calls[0]
    const headers = init?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer TEST_ACCESS')
  })

  it('skips Bearer header when skipAuth is true', async () => {
    setTokens({ access: 'TEST_ACCESS' })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 204 }),
    )

    await apiFetch('/public', { skipAuth: true })

    const [, init] = fetchSpy.mock.calls[0]
    const headers = (init?.headers ?? {}) as Record<string, string>
    expect(headers['Authorization']).toBeUndefined()
  })

  it('throws ApiError with parsed detail on non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Bad request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiFetch('/x', { skipAuth: true })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      detail: 'Bad request',
    })
  })

  it('serialises JSON body and sets Content-Type', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    await apiFetch('/post', { method: 'POST', body: { hello: 'world' }, skipAuth: true })

    const [, init] = fetchSpy.mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ hello: 'world' }))
    const headers = init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('returns undefined for 204 No Content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 204 }))
    const result = await apiFetch('/empty', { skipAuth: true })
    expect(result).toBeUndefined()
  })
})
