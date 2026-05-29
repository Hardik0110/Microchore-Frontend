import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function NotFoundPage() {
  const { user } = useAuth()
  const homePath = user
    ? user.role === 'COMPANY_ADMIN' || user.role === 'PLATFORM_ADMIN'
      ? '/company'
      : '/app'
    : '/'

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6 py-12 text-ink">
      <div className="max-w-md text-center flex flex-col gap-4">
        <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">404</p>
        <h1 className="font-serif text-3xl text-ink tracking-tighter">This page doesn&rsquo;t exist.</h1>
        <p className="text-sm text-ink-2">
          The link may be outdated or the page has moved. Head back to a known spot below.
        </p>
        <div className="flex justify-center">
          <Link
            to={homePath}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            Take me home
          </Link>
        </div>
      </div>
    </main>
  )
}
