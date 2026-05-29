import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
} from 'react'

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function safeHref(raw?: string | null): string | undefined {
  if (!raw) return undefined
  try {
    const u = new URL(raw)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : undefined
  } catch {
    return undefined
  }
}

export function safeInternalPath(raw?: string | null): string | undefined {
  if (!raw) return undefined
  if (raw.startsWith('//')) return undefined
  if (!raw.startsWith('/')) return undefined
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(raw)) return undefined
  return raw
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRelative(iso: string, now = new Date()) {
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatStampDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function shortId() {
  return Math.random().toString(36).slice(2, 10)
}

export type PasteTrackerStats = {
  charsTyped: number
  pasteCount: number
  pastedChars: number
  startedAt: number | null
  elapsedSec: number
}

export function usePasteTracker(value: string) {
  const [stats, setStats] = useState<PasteTrackerStats>({
    charsTyped: 0,
    pasteCount: 0,
    pastedChars: 0,
    startedAt: null,
    elapsedSec: 0,
  })
  const lastValueRef = useRef('')

  useEffect(() => {
    if (!stats.startedAt) return
    const id = window.setInterval(() => {
      setStats((s) =>
        s.startedAt ? { ...s, elapsedSec: Math.round((Date.now() - s.startedAt) / 1000) } : s
      )
    }, 1000)
    return () => window.clearInterval(id)
  }, [stats.startedAt])

  useEffect(() => {
    const delta = value.length - lastValueRef.current.length
    if (delta > 0) {
      setStats((s) => ({
        ...s,
        charsTyped: s.charsTyped + delta,
        startedAt: s.startedAt ?? Date.now(),
      }))
    }
    lastValueRef.current = value
  }, [value])

  const onPaste = useCallback((e: ClipboardEvent) => {
    const pasted = e.clipboardData?.getData('text') ?? ''
    if (!pasted) return
    setStats((s) => ({
      ...s,
      pasteCount: s.pasteCount + 1,
      pastedChars: s.pastedChars + pasted.length,
      charsTyped: Math.max(0, s.charsTyped - pasted.length),
      startedAt: s.startedAt ?? Date.now(),
    }))
  }, [])

  const reset = useCallback(() => {
    lastValueRef.current = ''
    setStats({ charsTyped: 0, pasteCount: 0, pastedChars: 0, startedAt: null, elapsedSec: 0 })
  }, [])

  const pastedRatio = useMemo(() => {
    const total = stats.charsTyped + stats.pastedChars
    if (!total) return 0
    return Math.round((stats.pastedChars / total) * 100)
  }, [stats.charsTyped, stats.pastedChars])

  return { stats, reset, pastedRatio, onPaste }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  const setAndPersist = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {}
        return resolved
      })
    },
    [key]
  )

  return [value, setAndPersist] as const
}
