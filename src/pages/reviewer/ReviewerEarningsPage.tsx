import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/primitives'
import { ApiError, apiGetReviewerStats, type ReviewerStats } from '../../lib/api'
import { formatCurrency } from '../../lib/ui-utils'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function ReviewerEarningsPage() {
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
          setError(err instanceof Error ? err.message : 'Could not load earnings.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Reviewer earnings</p>
        <h1 className="font-serif text-3xl text-ink tracking-tighter">Your reviewer payout history.</h1>
      </div>

      {loading ? (
        <p className="text-sm text-ink-3">Loading earnings…</p>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : !stats ? null : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Pending payout" value={formatCurrency(stats.totalPending)} />
            <SummaryCard label="Total paid" value={formatCurrency(stats.totalPaid)} />
            <SummaryCard label="Reviews completed" value={stats.reviewsCompleted.toLocaleString()} />
          </div>

          <Card className="p-5 flex flex-col gap-3">
            <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Recent payouts</p>
            {stats.recentEarnings.length === 0 ? (
              <p className="text-sm text-ink-3">No payout entries yet. Complete reviews to earn.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left font-mono text-2xs tracking-stamp uppercase text-ink-3 border-b border-divider">
                      <th className="py-2 pr-3">Project</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Earned</th>
                      <th className="py-2 pr-3">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEarnings.map((e) => (
                      <tr key={e.id} className="border-b border-divider">
                        <td className="py-2.5 pr-3 text-ink">{e.projectName ?? '(unknown)'}</td>
                        <td className="py-2.5 pr-3 text-ink font-mono">{formatCurrency(e.amount)}</td>
                        <td className="py-2.5 pr-3 text-ink-2">{e.status}</td>
                        <td className="py-2.5 pr-3 text-ink-3">{formatDate(e.createdAt)}</td>
                        <td className="py-2.5 pr-3 text-ink-3">{formatDate(e.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">{label}</p>
      <p className="font-serif text-2xl text-ink tracking-tight">{value}</p>
    </Card>
  )
}
