import { type ReactElement, type SVGProps } from 'react'
import { cn } from '../../lib/ui-utils'

type Platform = 'instagram' | 'youtube' | 'tiktok' | 'x'

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'Twitter',
}

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function svgProps({ size = 14, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: cn('shrink-0', className),
    ...rest,
  }
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M14 4v9.5a4.5 4.5 0 1 1-4.5-4.5" />
      <path d="M14 4c0 2.4 2 4.5 4.5 4.5" />
    </svg>
  )
}

export function SoundCloudIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 15v-4" />
      <path d="M7 16v-6" />
      <path d="M10 17V9" />
      <path d="M13 17V8a4 4 0 0 1 7.5-2 3 3 0 1 1 0 11H13" />
    </svg>
  )
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </svg>
  )
}

const PLATFORM_ICONS: Record<Platform, (p: IconProps) => ReactElement> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
}

type PlatformTagProps = {
  platform: Platform
  size?: number
  className?: string
  label?: string
}

export function PlatformTag({ platform, size = 14, className, label }: PlatformTagProps) {
  const Icon = PLATFORM_ICONS[platform]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-2xs tracking-stamp uppercase text-ink-3',
        className
      )}
    >
      <Icon size={size} className="text-ink-2" />
      {label ?? PLATFORM_LABELS[platform]}
    </span>
  )
}

export type { Platform }
