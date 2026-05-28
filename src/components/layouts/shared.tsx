import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type RefObject,
} from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cn, formatCurrency, formatRelative } from '../../lib/ui-utils'
import { type WizardStep } from '../../lib/auth'
import { useTheme } from '../../lib/theme'
import { useEarnings, useNotifications, useSubmissions, useTasks, type Notification } from '../../lib/store'
import { LayoutGridIcon as DashboardIcon } from '../ui/layout-grid'
import { CartIcon as MarketplaceIcon } from '../ui/cart'
import { WalletIcon as EarningsIcon } from '../ui/wallet'
import { MessageSquareIcon as FeedbackIcon } from '../ui/message-square'
import { InboxIcon as SubmissionsIcon } from '../ui/inbox'
import { ClipboardCheckIcon as QueueIcon } from '../ui/clipboard-check'
import { UserIcon as ProfileIcon } from '../ui/user'
import { SettingsIcon } from '../ui/settings'
import { LogoutIcon as LogOutIcon } from '../ui/logout'

export type IconHandle = { startAnimation: () => void; stopAnimation: () => void }

export type IconCompWithRef = ComponentType<
  HTMLAttributes<HTMLDivElement> & {
    size?: number
    className?: string
    ref?: RefObject<IconHandle | null>
  }
>

export const LogOutAnimated = LogOutIcon as unknown as IconCompWithRef

export type NavIcon = ComponentType<HTMLAttributes<HTMLDivElement> & { size?: number }>

export type NavItem = {
  path: string
  label: string
  icon: NavIcon
  end?: boolean
  hiddenForReviewer?: boolean
  requiresReviewer?: boolean
}
export type NavSection = { label: string; items: NavItem[] }

export const YEAR = 2026

export const WIZARD_ROUTES: Record<WizardStep, string> = {
  signup: '/signup',
  'verify-email': '/onboarding/verify-email',
  welcome: '/onboarding/welcome',
  'link-account': '/onboarding/link-account',
  attest: '/onboarding/attest',
  tutorial: '/onboarding/tutorial',
  'first-task': '/onboarding/first-task',
  done: '/app',
}

export const VISIBLE_STEPS: WizardStep[] = [
  'verify-email',
  'welcome',
  'link-account',
  'attest',
  'tutorial',
  'first-task',
]

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ path: '/app', label: 'Dashboard', icon: DashboardIcon, end: true }],
  },
  {
    label: 'Work',
    items: [
      { path: '/app/marketplace', label: 'Marketplace', icon: MarketplaceIcon, hiddenForReviewer: true },
      { path: '/app/submissions', label: 'Submissions', icon: SubmissionsIcon, hiddenForReviewer: true },
      { path: '/app/earnings', label: 'Earnings', icon: EarningsIcon },
      { path: '/app/feedback', label: 'Feedback', icon: FeedbackIcon },
    ],
  },
  {
    label: 'Reviewing',
    items: [{ path: '/app/queue', label: 'Queue', icon: QueueIcon, requiresReviewer: true }],
  },
  {
    label: 'Account',
    items: [
      { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
      { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
]

export const COMPANY_NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ path: '/company', label: 'Dashboard', icon: DashboardIcon, end: true }],
  },
  {
    label: 'Manage',
    items: [
      { path: '/company/projects', label: 'Projects', icon: MarketplaceIcon },
      { path: '/company/submissions', label: 'Submissions', icon: FeedbackIcon },
    ],
  },
  {
    label: 'Account',
    items: [{ path: '/company/settings', label: 'Settings', icon: SettingsIcon }],
  },
]

export function userInitial(email: string) {
  return email.charAt(0).toUpperCase() || '?'
}

export function ChevronLeftSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function LockIcon({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

export function ThemeToggleButton(_props: { expanded: boolean }) {
  const { resolved, setMode } = useTheme()
  const isDark = resolved === 'dark'
  const next = isDark ? 'light' : 'dark'

  return (
    <div className="flex items-center justify-center py-1">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Dark mode ${isDark ? 'on' : 'off'}`}
        title={`Switch to ${next} mode`}
        onClick={() => setMode(next)}
        className={cn(
          'relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          isDark ? 'bg-brand' : 'bg-ghost-soft'
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cn(
            'absolute left-1.5 top-1/2 -translate-y-1/2 transition-colors',
            isDark ? 'text-white/90' : 'text-ink-3'
          )}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 transition-colors',
            isDark ? 'text-white/90' : 'text-ink-3'
          )}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span
          aria-hidden
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
            isDark ? 'translate-x-[26px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

export function HeaderNotifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const hasUnread = unreadCount > 0

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onItemClick = useCallback(
    async (n: Notification) => {
      if (!n.isRead) {
        try { await markRead(n.id) } catch { void 0 }
      }
      if (n.link) {
        setOpen(false)
        navigate(n.link)
      }
    },
    [markRead, navigate],
  )

  const onMarkAll = useCallback(async () => {
    try { await markAllRead() } catch { void 0 }
  }, [markAllRead])

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={hasUnread ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors',
          'hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          open && 'bg-brand-soft text-brand'
        )}
      >
        <BellIcon />
        {hasUnread ? (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold leading-none ring-2 ring-bg"
            aria-hidden
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+10px)] w-[340px] max-h-[420px] flex flex-col rounded-lg border border-divider bg-surface shadow-[0_18px_44px_-24px_rgba(0,0,0,0.18)] z-30"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-divider">
            <span className="font-mono text-[10px] tracking-stamp uppercase text-brand">
              Notifications
            </span>
            {hasUnread ? (
              <button
                type="button"
                onClick={onMarkAll}
                className="text-[11px] font-medium text-brand hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm px-1"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </span>
              <p className="text-[13px] text-ink-2 leading-snug">You are all caught up.</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-divider">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(n)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors',
                      'hover:bg-brand-soft/40 focus-visible:outline-none focus-visible:bg-brand-soft/40',
                      !n.isRead && 'bg-brand-soft/20',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden />
                      ) : (
                        <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[13px] leading-snug', n.isRead ? 'text-ink-2' : 'text-ink font-medium')}>
                          {n.title}
                        </p>
                        {n.body ? (
                          <p className="mt-0.5 text-[12px] text-ink-3 leading-snug">{n.body}</p>
                        ) : null}
                        <p className="mt-1 font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function AppHeaderStats() {
  const earnings = useEarnings()
  const { submissions } = useSubmissions()
  const tasks = useTasks()

  const { pendingValue, pendingCount } = useMemo(() => {
    const taskMap = new Map(tasks.map((t) => [t.id, t]))
    const pendings = submissions.filter((s) => s.status === 'pending' && !s.isStarter)
    const value = pendings.reduce(
      (acc, s) => acc + (taskMap.get(s.taskId)?.payRate ?? 0),
      0
    )
    return { pendingValue: value, pendingCount: pendings.length }
  }, [submissions, tasks])

  const rating = earnings.averageRating ? earnings.averageRating.toFixed(2) : '·'

  return (
    <div className="flex items-center gap-5 font-mono text-[10px] tracking-stamp uppercase text-ink-3 tabular-nums">
      <span>
        <span className="text-ink-3">Earned</span>{' '}
        <span className="text-ink not-mono">{formatCurrency(earnings.totalEarned)}</span>
      </span>
      <span className="text-ink-3/40">·</span>
      <span>
        <span className="text-ink-3">Pending</span>{' '}
        <span className="text-ink">
          {pendingCount > 0 ? formatCurrency(pendingValue) : '·'}
        </span>
        {pendingCount > 0 ? <span className="text-ink-3"> · {pendingCount}</span> : null}
      </span>
      <span className="text-ink-3/40">·</span>
      <span>
        <span className="text-ink-3">Rating</span>{' '}
        <span className="text-ink">{rating}</span>
        <span className="text-ink-3">/5</span>
      </span>
    </div>
  )
}

export function AppNavLink({
  to,
  Icon,
  label,
  end,
  expanded,
  locked,
}: {
  to: string
  Icon: NavIcon
  label: string
  end?: boolean
  expanded: boolean
  locked?: boolean
}) {
  const iconRef = useRef<IconHandle | null>(null)
  const startIcon = useCallback(() => iconRef.current?.startAnimation(), [])
  const stopIcon = useCallback(() => iconRef.current?.stopAnimation(), [])

  const IconComponent = Icon as unknown as ComponentType<
    HTMLAttributes<HTMLDivElement> & { size?: number; ref?: RefObject<IconHandle | null> }
  >

  return (
    <NavLink
      to={to}
      end={end ?? to === '/app'}
      aria-label={expanded ? undefined : label}
      title={expanded ? undefined : label}
      onMouseEnter={startIcon}
      onMouseLeave={stopIcon}
      onFocus={startIcon}
      onBlur={stopIcon}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-md text-[14px] transition-colors',
          expanded ? 'gap-2.5 px-3 py-2' : 'justify-center w-10 h-10 mx-auto',
          isActive
            ? 'bg-brand-soft text-brand font-medium'
            : 'text-ink-2 hover:bg-brand-soft hover:text-brand'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && expanded ? (
            <span
              className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-brand"
              aria-hidden
            />
          ) : null}
          <IconComponent ref={iconRef} size={18} className="shrink-0 text-current" />
          {expanded ? (
            <>
              <span className="truncate">{label}</span>
              {locked ? (
                <LockIcon size={13} className="ml-auto shrink-0 text-ink-3" />
              ) : null}
            </>
          ) : locked ? (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface text-ink-3 ring-1 ring-divider"
              aria-hidden
              title="Locked"
            >
              <LockIcon size={9} />
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}
