import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSubmissions, type Submission } from '../lib/store'
import { Card } from '../components/ui/primitives'
import { formatCurrency } from '../lib/ui-utils'

type StatusKey = Submission['status']

const STATUS_LABEL: Record<StatusKey, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_CLASS: Record<StatusKey, string> = {
  pending: 'bg-grey-soft text-ink-2',
  approved: 'bg-brand-50 text-brand-700',
  rejected: 'bg-red-50 text-red-700',
}

function formatDate(iso?: string) {
  if (!iso) return '·'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function SubmissionsPage() {
  const { submissions } = useSubmissions()

  const rows = useMemo(
    () => [...submissions].sort((a, b) => {
      const ta = new Date(a.submittedAt).getTime()
      const tb = new Date(b.submittedAt).getTime()
      return tb - ta
    }),
    [submissions],
  )

  const totals = useMemo(() => {
    const earned = rows
      .filter((r) => r.status === 'approved')
      .reduce((acc, r) => acc + r.basePayout + r.bonusPayout, 0)
    const pending = rows.filter((r) => r.status === 'pending').length
    const approved = rows.filter((r) => r.status === 'approved').length
    const rejected = rows.filter((r) => r.status === 'rejected').length
    return { earned, pending, approved, rejected }
  }, [rows])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Submissions</h1>
        <p className="text-xs text-ink-3 mt-0.5">
          Every comment you have submitted. Approved ones pay out at the project rate.
        </p>
      </div>

      <section
        aria-label="Submission totals"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Stat label="Total earned" value={formatCurrency(totals.earned)} accent />
        <Stat label="Pending" value={String(totals.pending)} />
        <Stat label="Approved" value={String(totals.approved)} />
        <Stat label="Rejected" value={String(totals.rejected)} />
      </section>

      <Card className="p-0 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-6 flex flex-col gap-2">
            <p className="text-sm text-ink">No submissions yet.</p>
            <p className="text-xs text-ink-3">
              Pick a brief from the{' '}
              <Link to="/app/marketplace" className="text-brand hover:underline">marketplace</Link>{' '}
              and post your first comment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-[11px] uppercase tracking-wide text-ink-3 text-left">
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Reviewed</th>
                  <th className="px-4 py-3 font-medium text-right">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-bg/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-ink font-medium">{row.taskTitle}</span>
                        <span className="text-[11px] text-ink-3 uppercase tracking-wide">
                          {row.taskTone} {row.isStarter ? '· practice' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ' +
                        STATUS_CLASS[row.status]
                      }>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{formatDate(row.submittedAt)}</td>
                    <td className="px-4 py-3 text-ink-2">{formatDate(row.reviewedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {row.status === 'approved' ? (
                        <span className="text-ink font-medium">
                          {formatCurrency(row.basePayout + row.bonusPayout)}
                        </span>
                      ) : (
                        <span className="text-ink-3">·</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-divider bg-surface p-3 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-ink-3">{label}</span>
      <span className={accent ? 'text-brand text-lg font-semibold' : 'text-ink text-base font-medium'}>
        {value}
      </span>
    </div>
  )
}
