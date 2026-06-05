import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Logo } from '../ui/Logo'
import { LayoutGridIcon as DashboardIcon } from '../ui/layout-grid'
import { CartIcon as MarketplaceIcon } from '../ui/cart'
import {
  COMPANY_NAV_SECTIONS,
  HeaderNotifications,
} from './shared'
import { SidebarShell } from './SidebarShell'
import { useSidebarCollapse } from './useSidebarCollapse'

export function CompanyLayout() {
  const { user, logout, isHydrating } = useAuth()
  const navigate = useNavigate()
  const { collapsed, toggleCollapsed } = useSidebarCollapse()

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.role !== 'COMPANY_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
      navigate('/app', { replace: true })
    }
  }, [user, isHydrating, navigate])

  if (isHydrating) return null
  if (!user) return null
  if (user.role !== 'COMPANY_ADMIN' && user.role !== 'PLATFORM_ADMIN') return null

  const bottomNavItems = [
    { path: '/company', label: 'Dashboard', icon: DashboardIcon, end: true },
    { path: '/company/projects', label: 'Projects', icon: MarketplaceIcon },
  ]

  const handleSignOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <SidebarShell
      sections={COMPANY_NAV_SECTIONS}
      userEmail={user.email}
      displayName={user.linkedAccount?.handle ?? user.email.split('@')[0]}
      collapsed={collapsed}
      toggleCollapsed={toggleCollapsed}
      homeLink="/company"
      logoBadge={
        <span className="shrink-0 rounded-full bg-brand-soft text-brand px-2 py-0.5 text-2xs font-bold uppercase tracking-wider">
          Company
        </span>
      }
      mobileHeaderLeft={
        <Link to="/company" aria-label="microchore company home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
          <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
            · Company
          </span>
        </Link>
      }
      mobileHeaderRight={<HeaderNotifications />}
      headerSlot={<HeaderNotifications />}
      bottomNavItems={bottomNavItems}
      onSignOut={handleSignOut}
    />
  )
}
