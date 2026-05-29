import { useMemo, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/ui-utils'
import { haptics } from '../../lib/haptics'

type StampTone = 'approved' | 'rejected' | 'pending' | 'hot' | 'paid' | 'void'

const toneClasses: Record<StampTone, string> = {
  approved: 'text-stamp-green border-stamp-green',
  paid: 'text-stamp-green border-stamp-green',
  rejected: 'text-stamp-red border-stamp-red',
  void: 'text-stamp-red border-stamp-red',
  pending: 'text-r-brown border-r-brown',
  hot: 'text-danger border-danger',
}

const defaultLabels: Record<StampTone, string> = {
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
  void: 'Void',
  pending: 'Pending',
  hot: 'Hot',
}

type StampProps = {
  tone: StampTone
  children?: ReactNode
  className?: string
  rotateDeg?: number
  animateIn?: boolean
}

export function Stamp({ tone, children, className, rotateDeg, animateIn = false }: StampProps) {
  const label = children ?? defaultLabels[tone]
  const rotation = useMemo(() => {
    if (typeof rotateDeg === 'number') return rotateDeg
    const seed = `${tone}:${typeof label === 'string' ? label : ''}`
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = (h * 16777619) >>> 0
    }
    return ((h % 1000) / 1000) * 5 - 2.5
  }, [rotateDeg, tone, label])

  const baseClass = cn(
    'inline-block border-[1.5px] rounded-[4px] px-2.5 py-1 font-mono text-xs font-semibold tracking-stamp uppercase',
    toneClasses[tone],
    className,
  )

  if (!animateIn) {
    return (
      <span className={baseClass} style={{ transform: `rotate(${rotation}deg)` }}>
        {label}
      </span>
    )
  }

  return (
    <motion.span
      className={baseClass}
      initial={{ opacity: 0, scale: 4, rotate: rotation }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
      onAnimationComplete={() => haptics.stamp()}
      style={{ display: 'inline-block' }}
    >
      {label}
    </motion.span>
  )
}
