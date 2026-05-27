import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Eyebrow, HeadlineWithAccent, StatCard } from '../../components/ui/primitives'
import { Receipt } from '../../components/ui/Receipt'
import { useEarnings, type Submission } from '../../lib/store'
import { useAuth } from '../../lib/auth'
import { cn, formatCurrency, formatRelative } from '../../lib/ui-utils'
import { ReviewerEarningsPage } from '../reviewer/ReviewerEarningsPage'

export function EarningsPage() {
  const earnings = useEarnings()
  const { user } = useAuth()
  const weekly = useMemo(() => groupByWeek(earnings.approved), [earnings.approved])

  if (user?.isReviewer) return <ReviewerEarningsPage />

  return (
    <div className="flex flex-col gap-6">
      <header>
        <HeadlineWithAccent
          as="h1"
          text="Earned by the post."
          accents={['Earned']}
          className="text-[44px] leading-[1.05] tracking-tight font-medium text-ink"
        />
        <p className="mt-4 text-[15px] text-ink-2 leading-relaxed max-w-2xl">
          Approved within 48h. Earnings accrue here. Payout terms (date, method, threshold) are set
          per project and shown before you claim.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total earned"
          value={formatCurrency(earnings.totalEarned)}
          accent
          hint={`${earnings.approvedCount} approved`}
        />
        <StatCard
          label="Pending"
          value={earnings.pendingCount}
          hint="Reviewed within 48h"
        />
        <StatCard
          label="Rejected"
          value={earnings.rejectedCount}
          hint="No payout, no clawback"
        />
        <StatCard
          label="Avg rating"
          value={earnings.averageRating ? earnings.averageRating.toFixed(2) : '·'}
          hint="Across approved tasks"
        />
      </section>

      {earnings.approved.length === 0 ? (
        <Card>
          <Eyebrow>No earnings yet</Eyebrow>
          <p className="mt-2 text-[14px] text-ink-2 leading-relaxed">
            {user?.realTasksUnlocked
              ? 'Pick a task on the dashboard to land your first receipt.'
              : 'Finish the practice tasks to unlock real tasks and earnings.'}
          </p>
          <Link to="/app">
            <Button className="mt-4" variant="ghost">
              Open dashboard
            </Button>
          </Link>
        </Card>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 items-start">
          <Card className="p-0 overflow-hidden">
            <ul>
              {earnings.approved.map((s, i) => (
                <li
                  key={s.id}
                  className={cn(
                    'flex items-center justify-between gap-4 px-5 py-4',
                    i < earnings.approved.length - 1 && 'border-b border-divider'
                  )}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[14px] text-ink truncate">{s.taskTitle}</span>
                    <span className="text-[12px] text-ink-3">
                      Rated {s.rating}/5 · {formatRelative(s.reviewedAt ?? s.submittedAt)}
                    </span>
                  </div>
                  <span className="signature text-[20px] leading-none">
                    {formatCurrency(s.basePayout + s.bonusPayout)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-col gap-4">
            <Receipt
              serial={`LEDGER · WK ${currentIsoWeek()}`}
              header={'Cadence weekly'}
              subHeader={`Pays ${weekly.payoutDay}`}
              lines={weekly.lines}
              total={{ label: 'Subtotal', value: formatCurrency(weekly.subtotal) }}
              footerNote={
                weekly.subtotal >= 5 ? 'Above payout threshold' : 'Below $5 threshold'
              }
              stamp={{ tone: weekly.subtotal >= 5 ? 'paid' : 'pending' }}
              embedded
            />
            <Card className="bg-paper border-paper-edge">
              <Eyebrow>Payout terms</Eyebrow>
              <p className="mt-2 text-[13px] text-r-ink leading-relaxed">
                YRW pays workers directly through Airtm, PayPal, or crypto. Microchore exports the
                report on the cadence the project sets. We never hold money.
              </p>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}

function groupByWeek(approved: Submission[]) {
  const today = new Date()
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const lines = approved.slice(0, 4).map((s) => {
    const dt = new Date(s.reviewedAt ?? s.submittedAt)
    return {
      label: `${weekdays[dt.getDay()]} · ${s.taskTone} brief`,
      value: formatCurrency(s.basePayout + s.bonusPayout),
    }
  })
  const subtotal = approved.reduce((acc, s) => acc + s.basePayout + s.bonusPayout, 0)
  const friday = new Date(today)
  friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7))
  return {
    lines: lines.length ? lines : [{ label: 'No approvals yet this week', value: '$0.00' }],
    subtotal,
    payoutDay: friday.toLocaleDateString('en-US', { weekday: 'short' }),
  }
}

function currentIsoWeek() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return String(
    Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  ).padStart(2, '0')
}
