import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/primitives'
import { apiGetReviewerStats, ApiError, type ReviewerStats } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatCurrency } from '../../lib/ui-utils'

function formatRelative(iso: string | null): string {
  if (!iso) return 'never'
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function ReviewerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ReviewerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiGetReviewerStats()
      .then((s) => {
        if (cancelled) return
        setStats(s)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoading(false)
        if (err instanceof ApiError && err.status === 403) {
          setError('Reviewer access required.')
        } else {
          setError(err instanceof Error ? err.message : 'Could not load stats.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-ink-3">Loading reviewer stats…</p>
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-danger">{error}</p>
      </Card>
    )
  }

  if (!stats) return null

  const displayName = user?.handle || user?.email?.split('@')[0] || 'reviewer'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Reviewer dashboard</p>
        <h1 className="font-serif text-3xl text-ink tracking-tighter">Welcome back, {displayName}.</h1>
        <p className="text-sm text-ink-2">
          {stats.queueSize > 0
            ? `${stats.queueSize} submission${stats.queueSize === 1 ? '' : 's'} waiting in your queue.`
            : 'Queue is empty right now — check back in a few minutes.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tier" value={stats.tier} sub={`×${stats.multiplier.toFixed(2)} pay multiplier`} />
        <StatCard
          label="Reviews completed"
          value={stats.reviewsCompleted.toLocaleString()}
          sub={`${stats.recentReviewsLast7Days} in last 7 days`}
        />
        <StatCard
          label="Rolling accuracy"
          value={stats.rollingAccuracyScore != null ? `${stats.rollingAccuracyScore.toFixed(1)}%` : '—'}
          sub={`Last review ${formatRelative(stats.lastReviewAt)}`}
        />
        <StatCard
          label="Earnings (pending)"
          value={formatCurrency(stats.totalPending)}
          sub={`${formatCurrency(stats.totalPaid)} paid out`}
        />
      </div>

      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Queue</p>
          <Link to="/app/queue" className="text-xs text-brand hover:text-brand-deep transition-colors">
            Open queue
          </Link>
        </div>
        <p className="text-sm text-ink">
          {stats.queueSize > 0
            ? `${stats.queueSize} pending submission${stats.queueSize === 1 ? '' : 's'} ready for you.`
            : 'No pending submissions right now.'}
        </p>
        <p className="text-xs text-ink-3">
          Three independent reviews finalize each task. Be honest, be specific, justify each rating.
        </p>
      </Card>

      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Recent earnings</p>
          <Link to="/app/earnings" className="text-xs text-brand hover:text-brand-deep transition-colors">
            View all
          </Link>
        </div>
        {stats.recentEarnings.length === 0 ? (
          <p className="text-sm text-ink-3">No payout entries yet. Complete reviews to earn.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-divider">
            {stats.recentEarnings.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex flex-col">
                  <span className="text-ink">{e.projectName ?? '(unknown project)'}</span>
                  <span className="text-xs text-ink-3">{formatRelative(e.createdAt)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-ink">{formatCurrency(e.amount)}</span>
                  <span className="text-xs text-ink-3">{e.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">{label}</p>
      <p className="font-serif text-2xl text-ink tracking-tight">{value}</p>
      {sub ? <p className="text-xs text-ink-3">{sub}</p> : null}
    </Card>
  )
}
