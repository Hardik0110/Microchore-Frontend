import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { Eyebrow } from '../ui/primitives'

export function AuthLayout({
  children,
  eyebrow,
  showDot = false,
}: {
  children: ReactNode
  eyebrow?: string
  showDot?: boolean
}) {
  return (
    <main className="min-h-screen app-canvas text-ink flex flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-5 flex items-center justify-between">
        <Link to="/" aria-label="microchore home" className="transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
        </Link>
        <Link to="/" className="text-sm text-ink-3 transition-colors hover:text-brand">
          Back home
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[420px]">
          {eyebrow ? (
            <div className="mb-3">
              <Eyebrow dot={showDot}>{eyebrow}</Eyebrow>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </main>
  )
}

