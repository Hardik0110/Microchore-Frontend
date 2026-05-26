import { type SVGProps } from 'react'
import { cn } from '../../lib/ui-utils'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function svgProps({ size = 18, className, ...rest }: IconProps) {
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

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="3" width="7" height="9" rx="1.2" />
      <rect x="14" y="3" width="7" height="5" rx="1.2" />
      <rect x="14" y="12" width="7" height="9" rx="1.2" />
      <rect x="3" y="16" width="7" height="5" rx="1.2" />
    </svg>
  )
}

export function MarketplaceIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M3 9l1.6-4h14.8L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-7h6v7" />
    </svg>
  )
}

export function EarningsIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M6 3v18l2-2 2 2 2-2 2 2 2-2 2 2V3z" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  )
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <polyline points="15 6 9 12 15 18" />
    </svg>
  )
}

export function BrandMarkIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" strokeWidth={1} />
      <circle cx="12" cy="12" r="2" fill="#FF5B27" stroke="none" />
    </svg>
  )
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <line x1="4" y1="6" x2="13" y2="6" />
      <line x1="19" y1="6" x2="20" y2="6" />
      <circle cx="16" cy="6" r="2" />
      <line x1="4" y1="12" x2="6" y2="12" />
      <line x1="11" y1="12" x2="20" y2="12" />
      <circle cx="8.5" cy="12" r="2" />
      <line x1="4" y1="18" x2="11" y2="18" />
      <line x1="17" y1="18" x2="20" y2="18" />
      <circle cx="14" cy="18" r="2" />
    </svg>
  )
}
