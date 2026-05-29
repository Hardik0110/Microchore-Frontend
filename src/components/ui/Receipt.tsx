import { type ReactNode } from 'react'
import { cn } from '../../lib/ui-utils'
import { Stamp } from './Stamp'

type ReceiptLine = {
  label: ReactNode
  value: ReactNode
  emphasis?: boolean
}

type ReceiptStamp = {
  tone: 'approved' | 'rejected' | 'pending' | 'paid' | 'void' | 'hot'
  label?: string
}

type ReceiptProps = {
  serial?: string
  brand?: string
  header?: ReactNode
  subHeader?: ReactNode
  lines: ReceiptLine[]
  total?: { label: ReactNode; value: ReactNode }
  footerNote?: ReactNode
  stamp?: ReceiptStamp
  className?: string
  rotate?: boolean
  embedded?: boolean
}

export function Receipt({
  serial,
  brand = 'MICROCHORE',
  header,
  subHeader,
  lines,
  total,
  footerNote,
  stamp,
  className,
  rotate = false,
  embedded = false,
}: ReceiptProps) {
  return (
    <div
      className={cn(
        'receipt p-7 transition-transform duration-300 ease-out',
        rotate && !embedded && '-rotate-2 hover:-translate-y-1',
        embedded && 'rotate-0',
        className
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs font-bold tracking-stamp uppercase text-r-ink">
          {brand}
        </span>
        {serial ? (
          <span className="font-mono text-xs tracking-stamp uppercase text-r-ink-2">
            {serial}
          </span>
        ) : null}
      </div>

      {header || subHeader ? (
        <div className="flex items-baseline justify-between mt-2 text-r-ink-2 font-mono text-2xs uppercase tracking-stamp">
          <span>{header}</span>
          <span>{subHeader}</span>
        </div>
      ) : null}

      <hr className="my-4" />

      <ul className="space-y-2 text-sm">
        {lines.map((line, i) => (
          <li
            key={i}
            className={cn('flex justify-between', line.emphasis && 'font-semibold text-r-ink')}
          >
            <span>{line.label}</span>
            <span>{line.value}</span>
          </li>
        ))}
      </ul>

      {total ? (
        <>
          <hr className="my-4" />
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-semibold text-r-ink">{total.label}</span>
            <span className="signature text-xl leading-none">{total.value}</span>
          </div>
        </>
      ) : null}

      {stamp || footerNote ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-xs tracking-stamp uppercase text-r-ink-2">{footerNote}</span>
          {stamp ? <Stamp tone={stamp.tone}>{stamp.label}</Stamp> : null}
        </div>
      ) : null}
    </div>
  )
}
