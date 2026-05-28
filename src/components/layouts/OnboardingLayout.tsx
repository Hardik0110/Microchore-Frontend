import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Logo } from '../ui/Logo'
import { ProgressBar } from '../ui/primitives'
import { WIZARD_ROUTES, VISIBLE_STEPS } from './shared'

export function OnboardingLayout() {
  const { user, isHydrating } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isStandaloneLink =
    location.pathname.startsWith('/onboarding/link-account')

  useEffect(() => {
    if (isHydrating) return
    if (!user) {
      navigate('/signup', { replace: true })
      return
    }
    if (user.wizardStep === 'done') {
      if (isStandaloneLink) return
      navigate('/app', { replace: true })
      return
    }
    const expected = WIZARD_ROUTES[user.wizardStep]
    if (expected && !location.pathname.startsWith(expected)) {
      navigate(expected, { replace: true })
    }
  }, [user, isHydrating, location.pathname, navigate, isStandaloneLink])

  if (isHydrating) return null
  if (!user) return null
  if (user.wizardStep === 'done' && !isStandaloneLink) return null

  const isDone = user.wizardStep === 'done'
  const visibleIdx = isDone ? -1 : VISIBLE_STEPS.indexOf(user.wizardStep)
  const total = VISIBLE_STEPS.length
  const stepNumber = Math.max(1, visibleIdx + 1)

  return (
    <main className="min-h-screen app-canvas text-ink flex flex-col">
      <header className="mx-auto w-full max-w-3xl px-6 py-5 flex items-center justify-between">
        <Link to="/" aria-label="microchore home" className="transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
        </Link>
        {isDone ? (
          <Link to="/app/profile" className="font-mono text-[10px] tracking-stamp uppercase text-ink-3 hover:text-brand transition-colors">
            Back to profile
          </Link>
        ) : (
          <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
            Step {stepNumber} of {total}
          </span>
        )}
      </header>

      {isDone ? null : (
        <div className="mx-auto w-full max-w-3xl px-6 pb-3">
          <ProgressBar
            value={Math.max(0, visibleIdx)}
            total={total}
            segments
            ariaLabel="Onboarding progress"
          />
        </div>
      )}

      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-20">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
