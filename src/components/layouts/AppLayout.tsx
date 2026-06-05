import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { LayoutGridIcon as DashboardIcon } from '../ui/layout-grid'
import { CartIcon as MarketplaceIcon } from '../ui/cart'
import { WalletIcon as EarningsIcon } from '../ui/wallet'
import { MessageSquareIcon as FeedbackIcon } from '../ui/message-square'
import { UserIcon as ProfileIcon } from '../ui/user'
import { SettingsIcon } from '../ui/settings'
import {
  AppHeaderStats,
  HeaderNotifications,
  NAV_SECTIONS,
  WIZARD_ROUTES,
} from './shared'
import { SidebarShell } from './SidebarShell'
import { useSidebarCollapse } from './useSidebarCollapse'

export function AppLayout() {
  const { user, logout, isHydrating } = useAuth()
  const navigate = useNavigate()
  const { collapsed, toggleCollapsed } = useSidebarCollapse()

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.wizardStep !== 'done') {
      const target = WIZARD_ROUTES[user.wizardStep] ?? '/onboarding/verify-email'
      navigate(target, { replace: true })
    }
  }, [user, isHydrating, navigate])

  if (!user || user.wizardStep !== 'done') return null

  const bottomNavItems = [
    { path: '/app', label: 'Dashboard', icon: DashboardIcon, end: true },
    { path: '/app/marketplace', label: 'Marketplace', icon: MarketplaceIcon, locked: !user.realTasksUnlocked },
    { path: '/app/earnings', label: 'Earnings', icon: EarningsIcon },
    { path: '/app/feedback', label: 'Feedback', icon: FeedbackIcon },
    { path: '/app/profile', label: 'Profile', icon: ProfileIcon },
  ]

  const filterItems = (item: { hiddenForReviewer?: boolean; requiresReviewer?: boolean }) => {
    if (item.hiddenForReviewer && user.isReviewer) return false
    if (item.requiresReviewer && !user.isReviewer) return false
    return true
  }

  const handleSignOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  const mobileHeaderRight = (
    <>
      <Link
        to="/app/settings"
        aria-label="Settings"
        className="p-2 rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink"
      >
        <SettingsIcon size={20} />
      </Link>
      <HeaderNotifications />
    </>
  )

  return (
    <SidebarShell
      sections={NAV_SECTIONS}
      filterItems={filterItems}
      userEmail={user.email}
      displayName={user.linkedAccount?.handle ?? user.email.split('@')[0]}
      collapsed={collapsed}
      toggleCollapsed={toggleCollapsed}
      homeLink="/app"
      headerSlot={<AppHeaderStats />}
      bottomNavItems={bottomNavItems}
      mobileHeaderRight={mobileHeaderRight}
      onSignOut={handleSignOut}
    />
  )
}
