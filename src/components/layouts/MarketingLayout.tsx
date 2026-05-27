import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { YEAR } from './shared'

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
