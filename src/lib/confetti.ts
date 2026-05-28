import confetti from 'canvas-confetti'

const BRAND_COLORS = ['#2563EB', '#10B981', '#E0A346', '#60A5FA', '#34D399']

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function fireSideCannons(durationMs: number = 1500): void {
  if (prefersReducedMotion()) return
  const end = Date.now() + durationMs
  const colors = BRAND_COLORS
  const tick = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.9 },
      colors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.9 },
      colors,
      disableForReducedMotion: true,
    })
    if (Date.now() < end) {
      requestAnimationFrame(tick)
    }
  }
  tick()
}

export function fireBurst(): void {
  if (prefersReducedMotion()) return
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
  })
}
