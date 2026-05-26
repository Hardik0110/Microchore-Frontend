import { type ReactNode } from 'react'
import { cn } from '../../lib/ui-utils'

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
}

export function Stamp({ tone, children, className, rotateDeg = -2.5 }: StampProps) {
  const rotation = rotateDeg
  return (
    <span
      className={cn(
        'inline-block border-[1.5px] rounded-[4px] px-2.5 py-1 font-mono text-[11px] font-semibold tracking-stamp uppercase',
        toneClasses[tone],
        className
      )}
      style={{ transform: `rotate(${rotation < 0 ? rotation : -2.5}deg)` }}
    >
      {children ?? defaultLabels[tone]}
    </span>
  )
}
