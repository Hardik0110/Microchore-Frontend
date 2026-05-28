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
  const rotation = useMemo(() => {
    if (typeof rotateDeg === 'number') return rotateDeg
    return -2.5 + (Math.random() * 5 - 2.5)
  }, [rotateDeg])

  const baseClass = cn(
    'inline-block border-[1.5px] rounded-[4px] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-stamp uppercase',
    toneClasses[tone],
    className,
  )
  const label = children ?? defaultLabels[tone]

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
