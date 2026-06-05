import { useRef, type ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/ui-utils'
import { Logo } from '../ui/Logo'
import {
  AppNavLink,
  ChevronLeftSvg,
  ChevronRightSvg,
  LogOutAnimated,
  ThemeToggleButton,
  userInitial,
  type IconHandle,
  type NavIcon,
  type NavSection,
} from './shared'

interface BottomNavItem {
  path: string
  label: string
  icon: NavIcon
  end?: boolean
  locked?: boolean
}

interface SidebarShellProps {
  
  sections: NavSection[]
  
  filterItems?: (item: NavSection['items'][number]) => boolean
  
  userEmail: string
  
  displayName: string
  
  collapsed: boolean
  
  toggleCollapsed: () => void
  
  homeLink: string
  
  logoBadge?: ReactNode
  
  headerSlot?: ReactNode
  
  bottomNavItems: BottomNavItem[]
  mobileHeaderLeft?: ReactNode
  mobileHeaderRight?: ReactNode
  onSignOut: () => void
}

export function SidebarShell({
  sections,
  filterItems,
  userEmail,
  displayName,
  collapsed,
  toggleCollapsed,
  homeLink,
  logoBadge,
  headerSlot,
  bottomNavItems,
  mobileHeaderLeft,
  mobileHeaderRight,
  onSignOut,
}: SidebarShellProps) {
  const signOutIconRef = useRef<IconHandle | null>(null)
  const startSignOutIcon = () => signOutIconRef.current?.startAnimation()
  const stopSignOutIcon = () => signOutIconRef.current?.stopAnimation()

  const initial = userInitial(userEmail)

  return (
    <div className="h-screen h-svh flex overflow-hidden app-canvas text-ink">
      
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
            'shrink-0 flex items-center justify-center h-[60px] border-b border-divider',
            collapsed ? '' : 'px-4 gap-2'
          )}
        >
          {collapsed ? (
            <Link
              to={homeLink}
              aria-label="microchore home"
              className="flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-80"
            >
              <Logo variant="mark" className="h-6 w-6" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={homeLink}
                aria-label="microchore home"
                className="flex items-center min-w-0 transition-opacity hover:opacity-80"
              >
                <Logo className="h-8 w-auto" />
              </Link>
              {logoBadge}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="App sections">
          {sections.map((section, idx) => {
            const visibleItems = filterItems
              ? section.items.filter(filterItems)
              : section.items
            if (visibleItems.length === 0) return null
            return (
              <div key={section.label} className={idx > 0 ? 'mt-6' : ''}>
                {idx > 0 ? (
                  <div className={cn('mb-3 border-t border-divider mx-2', !collapsed && 'mb-4')} />
                ) : null}
                {!collapsed ? (
                  <p className="mb-2 px-3 text-2xs font-bold uppercase tracking-[0.1em] text-ink-3">
                    {section.label}
                  </p>
                ) : null}
                <div className="flex flex-col gap-1">
                  {visibleItems.map((item) => (
                    <AppNavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      expanded={!collapsed}
                      label={item.label}
                      Icon={item.icon}
                      locked={item.path === '/app/marketplace' && !!(item as { locked?: boolean }).locked}
                    />
                  ))}
                </div>
              </div>
            )
          })}
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-400 text-sm font-bold text-white"
              aria-hidden
              title={collapsed ? displayName : undefined}
            >
              {initial}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{displayName}</p>
                {userEmail ? (
                  <p className="truncate text-xs text-ink-3 mt-0.5">{userEmail}</p>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={onSignOut}
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
          {mobileHeaderLeft ?? (
            <Link to={homeLink} aria-label="microchore home" className="transition-opacity hover:opacity-80">
              <Logo className="h-8 w-auto" />
            </Link>
          )}
          <div className="flex items-center gap-1">
            {mobileHeaderRight}
          </div>
        </header>

        <header className="hidden md:flex shrink-0 h-[60px] items-center justify-end gap-6 px-6 lg:px-10 border-b border-divider bg-surface">
          {headerSlot}
          {headerSlot ? <span className="h-7 w-px bg-divider" aria-hidden /> : null}
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-6 md:px-5 md:pt-5 lg:px-10 lg:pb-12 max-w-content mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <nav className="md:hidden shrink-0 h-[56px] border-t border-divider bg-surface flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-30">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-1 text-2xs font-semibold transition-colors flex-1 min-w-0',
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
