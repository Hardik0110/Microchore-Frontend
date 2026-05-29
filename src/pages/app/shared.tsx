import { type ReactNode } from 'react'
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  type Platform,
} from '../../components/ui/PlatformTag'
import type { Task } from '../../lib/store'

export const PLATFORM_GLYPH = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
} satisfies Record<Platform, unknown>

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
}

export const PLATFORM_DOMAIN: Record<Platform, string> = {
  instagram: 'instagram.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
  x: 'X.com',
}

export function toneLabel(tone: Task['tone']) {
  return ({
    lifestyle: 'Lifestyle',
    product: 'Product',
    story: 'Story',
    disagreement: 'Discourse',
    brand: 'Brand',
  } as const)[tone]
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col overflow-hidden bg-surface border border-divider rounded-xl shadow-card">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-divider px-5">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}

export function EmptyRow({ message }: { message: string }) {
  return (
    <div className="h-full min-h-[160px] p-8 flex items-center justify-center text-center">
      <p className="text-sm text-ink-3 max-w-[40ch]">{message}</p>
    </div>
  )
}
