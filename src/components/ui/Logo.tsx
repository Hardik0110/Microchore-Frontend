type LogoVariant = 'full' | 'mark' | 'wordmark'

type LogoProps = {
  className?: string
  alt?: string
  variant?: LogoVariant
}

const SRC: Record<LogoVariant, string> = {
  full: '/logo.svg',
  mark: '/logo-mark.svg',
  wordmark: '/logo-wordmark.svg',
}

export function Logo({ className = 'h-6 w-auto', alt = 'microchore', variant = 'full' }: LogoProps) {
  return <img src={SRC[variant]} alt={alt} className={className} draggable={false} />
}
