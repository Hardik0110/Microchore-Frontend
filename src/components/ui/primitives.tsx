import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/ui-utils'

type ButtonVariant = 'primary' | 'ghost' | 'submitted' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-normal transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed'

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-[13px]',
  md: 'px-4 py-2.5 text-[13px]',
  lg: 'px-5 py-3 text-sm',
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white border border-brand font-medium shadow-sm hover:bg-brand-deep hover:border-brand-deep active:translate-y-0',
  ghost:
    'bg-transparent text-ink border border-divider font-medium hover:bg-muted hover:border-ink-3 active:translate-y-0',
  submitted: 'bg-surface text-ink-2 border border-divider cursor-not-allowed',
  danger:
    'bg-surface text-danger border border-divider hover:border-danger hover:bg-danger/10 active:translate-y-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        buttonBase,
        buttonSizes[size],
        buttonVariants[variant],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    />
  )
})

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

const inputBase =
  'w-full rounded-md border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        inputBase,
        hasError ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-divider',
        className
      )}
      {...rest}
    />
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        inputBase,
        'min-h-[120px] leading-relaxed resize-y',
        hasError ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-divider',
        className
      )}
      {...rest}
    />
  )
})

type FieldProps = {
  htmlFor: string
  label: ReactNode
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
}

export function Field({ htmlFor, label, helper, error, required, children }: FieldProps) {
  const helperId = helper ? `${htmlFor}-helper` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="text-ink-3 ml-1" aria-hidden>*</span> : null}
      </label>
      <div aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}>
        {children}
      </div>
      {error ? (
        <span id={errorId} role="alert" className="text-[12px] text-danger">
          {error}
        </span>
      ) : helper ? (
        <span id={helperId} className="text-[12px] text-ink-3">
          {helper}
        </span>
      ) : null}
    </div>
  )
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
  helper?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, helper, className, ...rest },
  ref
) {
  return (
    <label
      htmlFor={id}
      className={cn('flex items-start gap-3 cursor-pointer select-none', className)}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-divider text-brand accent-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        {...rest}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[13.5px] text-ink leading-snug">{label}</span>
        {helper ? <span className="text-[12px] text-ink-3 leading-snug">{helper}</span> : null}
      </span>
    </label>
  )
})

type CardProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function Card({ children, className, as: As = 'div' }: CardProps) {
  return (
    <As
      className={cn(
        'bg-surface border border-divider rounded-xl shadow-card p-6 transition-shadow',
        className
      )}
    >
      {children}
    </As>
  )
}

type EyebrowProps = {
  children: ReactNode
  dot?: boolean
  dotColor?: 'accent' | 'success' | 'danger' | 'info'
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-block font-mono text-[10px] tracking-stamp uppercase text-ink-3',
        className
      )}
    >
      {children}
    </span>
  )
}

type HeadlineWithAccentProps = {
  text: string
  accents: string[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
}

export function HeadlineWithAccent({
  text,
  accents,
  as: As = 'h1',
  className,
}: HeadlineWithAccentProps) {
  if (!accents.length) {
    return <As className={className}>{text}</As>
  }
  const escaped = accents.map((a) => a.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <As className={className}>
      {parts.map((part, i) => {
        if (!part) return null
        const isAccent = accents.some((a) => a.toLowerCase() === part.toLowerCase())
        if (isAccent) {
          return (
            <span key={i} className="signature signature-underline">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </As>
  )
}

type RowTagProps = {
  label: string
  tone?: 'accent' | 'info' | 'danger' | 'success' | 'neutral'
}

const rowTagDots: Record<NonNullable<RowTagProps['tone']>, string> = {
  accent: 'bg-accent',
  info: 'bg-info',
  danger: 'bg-danger',
  success: 'bg-success',
  neutral: 'bg-ink-3',
}

export function RowTag({ label, tone = 'neutral' }: RowTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-stamp uppercase text-ink-3">
      <span className={cn('h-1.5 w-1.5 rounded-full', rowTagDots[tone])} aria-hidden />
      {label}
    </span>
  )
}

type StatCardProps = {
  label: string
  value: ReactNode
  accent?: boolean
  hint?: ReactNode
}

export function StatCard({ label, value, accent, hint }: StatCardProps) {
  return (
    <div className="relative overflow-hidden bg-surface border border-divider rounded-xl shadow-card p-5 flex flex-col gap-2">
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-[3px]',
          accent ? 'bg-brand' : 'bg-divider'
        )}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
        {label}
      </p>
      <p
        className={cn(
          'font-mono font-bold leading-none tabular-nums text-[clamp(1.75rem,3vw,2.25rem)]',
          accent ? 'text-brand' : 'text-ink'
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-[12px] text-ink-3">{hint}</p> : null}
    </div>
  )
}

type ProgressBarProps = {
  value: number
  total: number
  segments?: boolean
  ariaLabel?: string
}

export function ProgressBar({ value, total, segments = false, ariaLabel }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.max(0, (value / total) * 100))
  if (segments) {
    return (
      <div
        className="flex gap-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-label={ariaLabel}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-1 rounded-sm transition-all duration-300',
              i < value ? 'bg-success' : i === value ? 'bg-brand shadow-[0_0_8px_rgb(var(--brand-rgb)/0.55)]' : 'bg-divider'
            )}
          />
        ))}
      </div>
    )
  }
  return (
    <div
      className="h-1 w-full rounded-full bg-divider overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={ariaLabel}
    >
      <div
        className="h-full bg-ink transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>
export function FieldLabel(props: FieldLabelProps) {
  return <label {...props} className={cn('text-[13px] font-medium text-ink', props.className)} />
}
