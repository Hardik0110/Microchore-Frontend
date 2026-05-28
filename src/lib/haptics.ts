type Pattern = number | number[]

function supports(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function vibrate(pattern: Pattern = 15): void {
  if (!supports() || prefersReducedMotion()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    void 0
  }
}

export const haptics = {
  tap: () => vibrate(10),
  confirm: () => vibrate(15),
  stamp: () => vibrate([12, 30, 8]),
  success: () => vibrate([10, 40, 20, 40, 10]),
  warn: () => vibrate([30, 50, 30]),
}
