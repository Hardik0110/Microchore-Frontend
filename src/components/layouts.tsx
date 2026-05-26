import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type HTMLAttributes,
  type RefObject,
} from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn, formatCurrency } from '../lib/ui-utils'
import { useAuth, type WizardStep } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { useEarnings, useSubmissions, useTasks } from '../lib/store'
import { Eyebrow, ProgressBar } from './ui/primitives'
import { LayoutGridIcon as DashboardIcon } from './ui/layout-grid'
import { CartIcon as MarketplaceIcon } from './ui/cart'
import { WalletIcon as EarningsIcon } from './ui/wallet'
import { MessageSquareIcon as FeedbackIcon } from './ui/message-square'
import { UserIcon as ProfileIcon } from './ui/user'
import { SettingsIcon } from './ui/settings'
import { LogoutIcon as LogOutIcon } from './ui/logout'
import { Logo } from './ui/Logo'

export type IconHandle = { startAnimation: () => void; stopAnimation: () => void }

type IconCompWithRef = ComponentType<
  HTMLAttributes<HTMLDivElement> & {
    size?: number
    className?: string
    ref?: RefObject<IconHandle | null>
  }
>

const LogOutAnimated = LogOutIcon as unknown as IconCompWithRef

type NavIcon = ComponentType<HTMLAttributes<HTMLDivElement> & { size?: number }>

type NavItem = { path: string; label: string; icon: NavIcon; end?: boolean }
type NavSection = { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [{ path: '/app', label: 'Dashboard', icon: DashboardIcon, end: true }],
  },
  {
    label: 'Work',
    items: [
      { path: '/app/marketplace', label: 'Marketplace', icon: MarketplaceIcon },
      { path: '/app/submissions', label: 'Submissions', icon: FeedbackIcon },
      { path: '/app/earnings', label: 'Earnings', icon: EarningsIcon },
      { path: '/app/feedback', label: 'Feedback', icon: FeedbackIcon },
    ],
  },
  {
    label: 'Reviewing',
    items: [
      { path: '/app/reviewer', label: 'Queue', icon: FeedbackIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
      { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
    ],
  },
]

function userInitial(email: string) {
  return email.charAt(0).toUpperCase() || '?'
}

const YEAR = 2026

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link to="/" aria-label="microchore home" className="transition-opacity hover:opacity-80">
          <Logo className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7 text-sm text-ink-2">
          <a href="#how" className="nav-link hidden sm:inline-block">How it works</a>
          <a href="#creators" className="nav-link hidden sm:inline-block">For creators</a>
          <a href="#pricing" className="nav-link hidden sm:inline-block">Pricing</a>
          <Link
            to="/login"
            className="btn-ghost inline-flex items-center rounded-md border border-divider bg-surface px-4 py-2 text-sm font-medium text-ink"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>

      <footer className="border-t border-divider">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-xs text-ink-3">
          <Logo className="h-6 w-auto opacity-70" />
          <span>&copy; {YEAR} YRW Technologies</span>
        </div>
      </footer>
    </main>
  )
}

export function AuthLayout({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <main className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-5 flex items-center justify-between">
        <Link to="/" aria-label="microchore home" className="transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
        </Link>
        <Link to="/" className="text-[13px] text-ink-3 transition-colors hover:text-brand">
          Back home
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[420px]">
          {eyebrow ? (
            <div className="mb-3">
              <Eyebrow dot>{eyebrow}</Eyebrow>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </main>
  )
}

const WIZARD_ROUTES: Record<WizardStep, string> = {
  signup: '/signup',
  'verify-email': '/onboarding/verify-email',
  welcome: '/onboarding/welcome',
  'link-account': '/onboarding/link-account',
  attest: '/onboarding/attest',
  tutorial: '/onboarding/tutorial',
  'first-task': '/onboarding/first-task',
  done: '/app',
}

const VISIBLE_STEPS: WizardStep[] = [
  'verify-email',
  'welcome',
  'link-account',
  'attest',
  'tutorial',
  'first-task',
]

export function OnboardingLayout() {
  const { user, isHydrating } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/signup', { replace: true })
      return
    }
    if (user.wizardStep === 'done') {
      navigate('/app', { replace: true })
      return
    }
    const expected = WIZARD_ROUTES[user.wizardStep]
    if (expected && !location.pathname.startsWith(expected)) {
      navigate(expected, { replace: true })
    }
  }, [user, isHydrating, location.pathname, navigate])

  if (isHydrating) return null
  if (!user || user.wizardStep === 'done') return null

  const visibleIdx = VISIBLE_STEPS.indexOf(user.wizardStep)
  const total = VISIBLE_STEPS.length
  const stepNumber = Math.max(1, visibleIdx + 1)

  return (
    <main className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="mx-auto w-full max-w-3xl px-6 py-5 flex items-center justify-between">
        <Link to="/" aria-label="microchore home" className="transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
        </Link>
        <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
          Step {stepNumber} of {total}
        </span>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 pb-3">
        <ProgressBar
          value={Math.max(0, visibleIdx)}
          total={total}
          segments
          ariaLabel="Onboarding progress"
        />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-20">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

function ThemeToggleButton(_props: { expanded: boolean }) {
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

function HeaderNotifications() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const inStarterPhase = !!user && !user.realTasksUnlocked && !user.holdReason
  const hasUnread = inStarterPhase

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={hasUnread ? 'Notifications, 1 unread' : 'Notifications'}
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
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--paper-edge)',
            color: 'var(--r-ink)',
          }}
          className="absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-lg border p-5 shadow-[0_18px_44px_-24px_rgba(0,0,0,0.35)] z-30"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-stamp uppercase" style={{ color: 'var(--r-ink-3)' }}>
              Notifications
            </span>
          </div>
          {inStarterPhase ? (
            <div className="flex flex-col gap-2">
              <p className="text-[14px] font-medium leading-snug" style={{ color: 'var(--r-ink)' }}>
                Your first 5 tasks are read by hand.
              </p>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--r-ink-2)' }}>
                Most submissions are reviewed inside 48 hours. Real briefs unlock once three of five
                are approved.
              </p>
              <p
                className="font-serif text-[14px] leading-snug mt-1"
                style={{ color: 'var(--r-brown)' }}
              >
                Take your time. Your voice is what we pay for.
              </p>
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--r-ink-2)' }}>
              You are all caught up.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function AppHeaderStats() {
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

const SIDEBAR_STORAGE_KEY = 'microchore_sidebar_collapsed'

function ChevronLeftSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function AppLayout() {
  const { user, logout, isHydrating } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const signOutIconRef = useRef<IconHandle | null>(null)
  const startSignOutIcon = () => signOutIconRef.current?.startAnimation()
  const stopSignOutIcon = () => signOutIconRef.current?.stopAnimation()

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.wizardStep !== 'done') {
      navigate(WIZARD_ROUTES[user.wizardStep], { replace: true })
    }
  }, [user, isHydrating, navigate])

  if (!user || user.wizardStep !== 'done') return null

  const initial = userInitial(user.email)
  const displayName = user.linkedAccount?.handle ?? user.email.split('@')[0]

  return (
    <div className="h-screen h-svh flex overflow-hidden bg-bg text-ink">
      <aside
        className={cn(
          'hidden md:flex fixed left-0 top-0 bottom-0 z-30 bg-surface border-r border-divider flex-col transition-[width] duration-300 ease-out',
          collapsed ? 'w-[64px]' : 'w-[240px]'
        )}
        aria-label="Primary navigation"
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute -right-[14px] top-[46px] z-40 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center shadow-md ring-2 ring-bg transition-[background-color,transform] hover:bg-brand-deep hover:scale-105"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightSvg /> : <ChevronLeftSvg />}
        </button>
        <div
          className={cn(
            'shrink-0 flex items-center h-[60px] border-b border-divider',
            collapsed ? 'justify-center' : 'px-4'
          )}
        >
          {collapsed ? (
            <Link
              to="/app"
              aria-label="microchore home"
              className="flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-80"
            >
              <Logo variant="mark" className="h-6 w-6" />
            </Link>
          ) : (
            <Link
              to="/app"
              aria-label="microchore home"
              className="flex items-center min-w-0 transition-opacity hover:opacity-80"
            >
              <Logo className="h-8 w-auto" />
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="App sections">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.label} className={idx > 0 ? 'mt-6' : ''}>
              {idx > 0 ? (
                <div className={cn('mb-3 border-t border-divider mx-2', !collapsed && 'mb-4')} />
              ) : null}
              {!collapsed ? (
                <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-3">
                  {section.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <AppNavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    expanded={!collapsed}
                    label={item.label}
                    Icon={item.icon}
                    locked={item.path === '/app/marketplace' && !user.realTasksUnlocked}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-3 border-t border-divider" />

        <div className={cn('shrink-0', collapsed ? 'px-2 py-2' : 'px-3 py-2')}>
          <ThemeToggleButton expanded={!collapsed} />
        </div>

        <div className="mx-3 border-t border-divider" />

        <div className={cn('shrink-0', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
          <div
            className={cn(
              'flex items-center rounded-xl',
              collapsed
                ? 'flex-col gap-2 px-1 py-2'
                : 'gap-3 px-3 py-2 transition-colors hover:bg-muted'
            )}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-400 text-[13px] font-bold text-white"
              aria-hidden
              title={collapsed ? displayName : undefined}
            >
              {initial}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{displayName}</p>
                {user.email ? (
                  <p className="truncate text-[11.5px] text-ink-3 mt-0.5">{user.email}</p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/', { replace: true })
              }}
              onMouseEnter={startSignOutIcon}
              onMouseLeave={stopSignOutIcon}
              onFocus={startSignOutIcon}
              onBlur={stopSignOutIcon}
              className="shrink-0 rounded-lg p-2 text-ink-3 transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Sign out ${displayName}`}
            >
              <LogOutAnimated ref={signOutIconRef} size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden ml-0 transition-[margin-left] duration-300 ease-out',
          collapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        )}
      >
        <header className="md:hidden shrink-0 h-[60px] flex items-center justify-between px-4 border-b border-divider bg-surface">
          <Link to="/app" aria-label="microchore home" className="transition-opacity hover:opacity-80">
            <Logo className="h-8 w-auto" />
          </Link>
          <HeaderNotifications />
        </header>

        <header className="hidden md:flex shrink-0 h-[60px] items-center justify-end gap-6 px-6 lg:px-10 border-b border-divider bg-surface">
          <Link
            to="/company"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
            </svg>
            Company view
          </Link>
          <span className="h-7 w-px bg-divider" aria-hidden />
          <AppHeaderStats />
          <span className="h-7 w-px bg-divider" aria-hidden />
          <HeaderNotifications />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-6 md:px-5 md:pt-5 lg:px-10 lg:pt-10 lg:pb-12 max-w-content mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <nav className="md:hidden shrink-0 h-[56px] border-t border-divider bg-surface flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-30">
          {[
            { path: '/app', label: 'Dashboard', icon: DashboardIcon, end: true },
            { path: '/app/marketplace', label: 'Marketplace', icon: MarketplaceIcon, locked: !user.realTasksUnlocked },
            { path: '/app/earnings', label: 'Earnings', icon: EarningsIcon },
            { path: '/app/feedback', label: 'Feedback', icon: FeedbackIcon },
            { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
          ].map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-1 text-[10px] font-semibold transition-colors flex-1 min-w-0',
                    isActive ? 'text-brand' : 'text-ink-3 hover:text-brand',
                    item.locked && 'opacity-40 pointer-events-none'
                  )
                }
              >
                <Icon size={18} className="shrink-0 mb-0.5 text-current" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function LockIcon({ size = 12, className }: { size?: number; className?: string }) {
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

function AppNavLink({
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

const COMPANY_NAV_SECTIONS: NavSection[] = [
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

export function CompanyLayout() {
  const { user, logout, isHydrating } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const signOutIconRef = useRef<IconHandle | null>(null)
  const startSignOutIcon = () => signOutIconRef.current?.startAnimation()
  const stopSignOutIcon = () => signOutIconRef.current?.stopAnimation()

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, isHydrating, navigate])

  if (isHydrating) return null
  if (!user) return null

  const initial = userInitial(user.email)
  const displayName = user.linkedAccount?.handle ?? user.email.split('@')[0]

  return (
    <div className="h-screen h-svh flex overflow-hidden bg-bg text-ink">
      <aside
        className={cn(
          'hidden md:flex fixed left-0 top-0 bottom-0 z-30 bg-surface border-r border-divider flex-col transition-[width] duration-300 ease-out',
          collapsed ? 'w-[64px]' : 'w-[240px]'
        )}
        aria-label="Primary navigation"
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className="absolute -right-[14px] top-[46px] z-40 w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center shadow-md ring-2 ring-bg transition-[background-color,transform] hover:bg-brand-deep hover:scale-105"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightSvg /> : <ChevronLeftSvg />}
        </button>
        <div
          className={cn(
            'shrink-0 flex items-center h-[60px] border-b border-divider',
            collapsed ? 'justify-center' : 'px-4 gap-2'
          )}
        >
          {collapsed ? (
            <Link
              to="/company"
              aria-label="microchore company home"
              className="flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-80"
            >
              <Logo variant="mark" className="h-6 w-6" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to="/company"
                aria-label="microchore company home"
                className="flex items-center min-w-0 transition-opacity hover:opacity-80"
              >
                <Logo className="h-8 w-auto" />
              </Link>
              <span className="shrink-0 rounded-full bg-brand-soft text-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Company
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="App sections">
          {COMPANY_NAV_SECTIONS.map((section, idx) => (
            <div key={section.label} className={idx > 0 ? 'mt-6' : ''}>
              {idx > 0 ? (
                <div className={cn('mb-3 border-t border-divider mx-2', !collapsed && 'mb-4')} />
              ) : null}
              {!collapsed ? (
                <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-3">
                  {section.label}
                </p>
              ) : null}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <AppNavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    expanded={!collapsed}
                    label={item.label}
                    Icon={item.icon}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-3 border-t border-divider" />

        <div className={cn('shrink-0', collapsed ? 'px-2 py-2' : 'px-3 py-2')}>
          <ThemeToggleButton expanded={!collapsed} />
        </div>

        <div className="mx-3 border-t border-divider" />

        <div className={cn('shrink-0', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
          <div
            className={cn(
              'flex items-center rounded-xl',
              collapsed
                ? 'flex-col gap-2 px-1 py-2'
                : 'gap-3 px-3 py-2 transition-colors hover:bg-muted'
            )}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-400 text-[13px] font-bold text-white"
              aria-hidden
              title={collapsed ? displayName : undefined}
            >
              {initial}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{displayName}</p>
                {user.email ? (
                  <p className="truncate text-[11.5px] text-ink-3 mt-0.5">{user.email}</p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/', { replace: true })
              }}
              onMouseEnter={startSignOutIcon}
              onMouseLeave={stopSignOutIcon}
              onFocus={startSignOutIcon}
              onBlur={stopSignOutIcon}
              className="shrink-0 rounded-lg p-2 text-ink-3 transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Sign out ${displayName}`}
            >
              <LogOutAnimated ref={signOutIconRef} size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden ml-0 transition-[margin-left] duration-300 ease-out',
          collapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        )}
      >
        <header className="md:hidden shrink-0 h-[60px] flex items-center justify-between px-4 border-b border-divider bg-surface">
          <Link to="/company" aria-label="microchore company home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="h-8 w-auto" />
            <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
              · Company
            </span>
          </Link>
          <HeaderNotifications />
        </header>

        <header className="hidden md:flex shrink-0 h-[60px] items-center justify-end gap-6 px-6 lg:px-10 border-b border-divider bg-surface">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Worker view
          </Link>
          <span className="h-7 w-px bg-divider" aria-hidden />
          <HeaderNotifications />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-6 md:px-5 md:pt-5 lg:px-10 lg:pt-10 lg:pb-12 max-w-content mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <nav className="md:hidden shrink-0 h-[56px] border-t border-divider bg-surface flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-30">
          {[
            { path: '/company', label: 'Dashboard', icon: DashboardIcon, end: true },
            { path: '/company/projects', label: 'Projects', icon: MarketplaceIcon },
            { path: '/company/submissions', label: 'Reviews', icon: FeedbackIcon },
            { path: '/company/settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-1 text-[10px] font-semibold transition-colors flex-1 min-w-0',
                    isActive ? 'text-brand' : 'text-ink-3 hover:text-brand'
                  )
                }
              >
                <Icon size={18} className="shrink-0 mb-0.5 text-current" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export { WIZARD_ROUTES }
