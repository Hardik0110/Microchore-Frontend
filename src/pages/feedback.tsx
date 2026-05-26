import { useMemo, useState } from 'react'
import { StatCard } from '../components/ui/primitives'
import { Stamp } from '../components/ui/Stamp'
import { useSubmissions, type Submission } from '../lib/store'
import { cn, formatRelative } from '../lib/ui-utils'

type FilterKey = 'all' | 'approved' | 'rejected' | 'pending' | 'practice'

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  practice: 'Practice',
}

export function FeedbackPage() {
  const { submissions } = useSubmissions()
  const [filter, setFilter] = useState<FilterKey>('all')

  const stats = useMemo(() => {
    const approved = submissions.filter((s) => s.status === 'approved')
    const rejected = submissions.filter((s) => s.status === 'rejected')
    const pending = submissions.filter((s) => s.status === 'pending')
    const reviewed = approved.length + rejected.length
    const ratedApproved = approved.filter((s) => s.rating !== undefined)
    const avgRating =
      ratedApproved.length > 0
        ? ratedApproved.reduce((acc, s) => acc + (s.rating ?? 0), 0) / ratedApproved.length
        : 0
    const approvalRate = reviewed > 0 ? Math.round((approved.length / reviewed) * 100) : 0
    return {
      total: submissions.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: pending.length,
      avgRating,
      approvalRate,
      reviewed,
    }
  }, [submissions])

  const counts = useMemo<Record<FilterKey, number>>(() => {
    return {
      all: submissions.length,
      approved: stats.approved,
      rejected: stats.rejected,
      pending: stats.pending,
      practice: submissions.filter((s) => s.isStarter).length,
    }
  }, [submissions, stats])

  const filtered = useMemo(() => {
    const list = [...submissions].sort((a, b) => {
      const ta = new Date(a.reviewedAt ?? a.submittedAt).getTime()
      const tb = new Date(b.reviewedAt ?? b.submittedAt).getTime()
      return tb - ta
    })
    if (filter === 'all') return list
    if (filter === 'practice') return list.filter((s) => s.isStarter)
    return list.filter((s) => s.status === filter)
  }, [submissions, filter])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Feedback</h1>
        <p className="text-xs text-ink-3 mt-0.5">
          Every review, every score, every rejection: all of it lives here.
        </p>
      </div>

      <section
        aria-label="Feedback stats"
        className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
      >
        <StatCard
          label="Avg rating"
          value={stats.avgRating ? `${stats.avgRating.toFixed(2)}/5` : '·'}
          accent
          hint={`${stats.approved} approved`}
        />
        <StatCard
          label="Approval rate"
          value={stats.reviewed > 0 ? `${stats.approvalRate}%` : '·'}
          accent
          hint={`${stats.reviewed} reviewed`}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          hint="No payout, no clawback"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          hint="Awaiting review"
        />
      </section>

      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors',
              filter === k
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-ink border-divider hover:border-brand'
            )}
          >
            {FILTER_LABELS[k]}
            <span
              className={cn(
                'inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-semibold tabular-nums',
                filter === k ? 'bg-white/20 text-white' : 'bg-muted text-ink-3'
              )}
            >
              {counts[k]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-surface border border-divider rounded-xl shadow-card overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b border-divider px-5">
          <h3 className="text-[14px] font-semibold text-ink">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </h3>
          <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-3">
            Newest first
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 flex items-center justify-center text-center">
            <p className="text-[13px] text-ink-3 max-w-[40ch]">
              {filter === 'all'
                ? 'No submissions yet. Start a practice brief from the dashboard.'
                : `No ${FILTER_LABELS[filter].toLowerCase()} entries to show.`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-divider">
            {filtered.map((s) => (
              <FeedbackRow key={s.id} submission={s} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={i < rating ? 'text-brand' : 'text-ink-3/40'}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function FeedbackRow({ submission }: { submission: Submission }) {
  const isReviewed = submission.status !== 'pending'
  const note =
    submission.justification ??
    (submission.status === 'pending'
      ? 'Awaiting review.'
      : 'No reviewer note was recorded.')

  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {submission.isStarter ? (
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3">
                Practice
              </span>
            ) : null}
            <h4 className="text-[14px] font-semibold text-ink truncate">
              {submission.taskTitle}
            </h4>
          </div>
          <span className="text-[11.5px] text-ink-3">
            {isReviewed && submission.reviewedAt
              ? `Reviewed ${formatRelative(submission.reviewedAt)}`
              : `Submitted ${formatRelative(submission.submittedAt)}`}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {submission.rating ? <StarRating rating={submission.rating} /> : null}
          {submission.status === 'pending' ? <Stamp tone="pending">In review</Stamp> : null}
          {submission.status === 'approved' ? <Stamp tone="approved" /> : null}
          {submission.status === 'rejected' ? <Stamp tone="rejected" /> : null}
        </div>
      </div>

      <p
        className={cn(
          'text-[13px] leading-relaxed',
          submission.justification ? 'text-ink-2' : 'text-ink-3'
        )}
      >
        {note}
      </p>

      {submission.text ? (
        <div className="rounded-md border border-divider bg-bg/60 px-3 py-2 text-[12.5px] text-ink-2 leading-relaxed">
          <span className="block font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-1">
            Your comment
          </span>
          {submission.text}
        </div>
      ) : null}
    </li>
  )
}
