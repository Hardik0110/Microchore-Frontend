import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button, Card, RowTag } from '../../components/ui/primitives'
import { PlatformTag } from '../../components/ui/PlatformTag'
import { Stamp } from '../../components/ui/Stamp'
import { useSubmissions, useTasks, type Submission, type Task } from '../../lib/store'
import { useAuth } from '../../lib/auth'
import { cn, formatCurrency } from '../../lib/ui-utils'
import { EmptyRow, PLATFORM_GLYPH, SectionCard, toneLabel } from './shared'
import { ReviewerDashboardPage } from '../reviewer/ReviewerDashboardPage'

export function DashboardPage() {
  const { user } = useAuth()
  const tasks = useTasks()
  const { submissions } = useSubmissions()

  if (user?.isReviewer) return <ReviewerDashboardPage />

  const displayName = user?.linkedAccount?.handle ?? user?.email.split('@')[0] ?? 'there'
  const dateLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })
    .toUpperCase()
    .replace(',', ' ·')

  const starterTasks = tasks.filter((t) => t.kind === 'starter')
  const realTasks = tasks.filter((t) => t.kind === 'real')
  const starterSubs = submissions.filter((s) => s.isStarter)
  const submittedStarterIds = new Set(starterSubs.map((s) => s.taskId))
  const submittedAllStarter = starterTasks.every((t) => submittedStarterIds.has(String(t.id)))
  const reviewedStarter = starterSubs.filter((s) => s.status !== 'pending')
  const starterReviewedAll = reviewedStarter.length === starterTasks.length

  const realTasksUnlocked = (user?.realTasksUnlocked ?? false) && starterReviewedAll
  const accountOnHold = !!user?.holdReason

  const totalSubmittedStarter = starterSubs.length
  const submittedStarterIdSet = new Set(starterSubs.map((s) => s.taskId))
  const nextStarter = starterTasks.find((t) => !submittedStarterIdSet.has(String(t.id)))
  const latestApprovals = useMemo(() => {
    const approved = submissions.filter((s) => s.status === 'approved')
    return [...approved]
      .sort((a, b) => {
        const ta = new Date(a.reviewedAt ?? a.submittedAt).getTime()
        const tb = new Date(b.reviewedAt ?? b.submittedAt).getTime()
        return tb - ta
      })
      .slice(0, 5)
  }, [submissions])

  const streak = useMemo(() => {
    const approved = submissions.filter((s) => s.status === 'approved')
    if (approved.length === 0) return 0
    const days = new Set(
      approved.map((s) => {
        const d = new Date(s.reviewedAt ?? s.submittedAt)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      }),
    )
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const yest = new Date(today)
    yest.setDate(today.getDate() - 1)
    const yestKey = `${yest.getFullYear()}-${yest.getMonth()}-${yest.getDate()}`
    if (!days.has(todayKey) && !days.has(yestKey)) return 0
    let count = 0
    const cursor = new Date(today)
    if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1)
    for (let i = 0; i < 365; i++) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`
      if (days.has(key)) {
        count += 1
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
    return count
  }, [submissions])
  const stripCtaTo = nextStarter
    ? `/app/tasks/${nextStarter.id}`
    : realTasksUnlocked
    ? '/app/marketplace'
    : '/app'
  const stripCtaLabel = nextStarter
    ? 'Continue practice'
    : realTasksUnlocked
    ? 'Open marketplace'
    : 'Awaiting review'

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden flex items-center justify-between gap-4 rounded-2xl border border-divider-warm bg-brand-soft px-4 py-3 shadow-card">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-brand/15 via-transparent to-transparent" />
        <div className="flex items-center gap-3 min-w-0 relative">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-brand shadow-sm">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <p className="text-[13.5px] text-ink truncate">
            <span className="font-bold">{displayName}</span> ·{' '}
            <span className="font-bold">
              {totalSubmittedStarter} of {starterTasks.length}
            </span>{' '}
            practice submitted.{' '}
            <span className="text-ink-2 hidden sm:inline">
              Real briefs unlock at 3 of 5 approved.
            </span>
          </p>
        </div>
        <Link
          to={stripCtaTo}
          className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 text-[13px] font-medium text-ink transition-colors hover:bg-surface/60 whitespace-nowrap shrink-0 relative"
        >
          {stripCtaLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="text-xs text-ink-3 mt-0.5">
            {dateLabel} · {realTasksUnlocked ? 'Cleared for real briefs' : accountOnHold ? 'On hold' : 'Practice run in progress'}
          </p>
        </div>
        {streak > 0 ? (
          <div className="flex items-center gap-2.5 rounded-full border border-divider bg-surface px-3.5 py-1.5 shadow-card">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </span>
            <div className="flex items-baseline gap-1.5">
              <motion.span
                key={streak}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.6, duration: 0.5 }}
                className="font-mono text-[20px] font-bold tabular-nums text-ink leading-none"
              >
                {streak}
              </motion.span>
              <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                {streak === 1 ? 'day streak' : 'day streak'}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {accountOnHold ? (
        <Card className="border-l-4 border-l-danger">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex flex-col gap-2 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-danger">
                Held
              </p>
              <h3 className="text-[18px] font-bold text-ink leading-snug">
                Three of your five practice tasks did not pass.
              </h3>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">
                Real tasks stay locked while we look at this together. Write us a short note, and
                we will read it inside a day.
              </p>
              <div className="mt-2">
                <Button variant="ghost" size="sm">Open appeal</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:auto-rows-fr lg:min-h-[420px]">
        {!realTasksUnlocked && !accountOnHold ? (
          <StarterRunSection
            tasks={starterTasks}
            submissions={starterSubs}
            submittedAll={submittedAllStarter}
            reviewedAll={starterReviewedAll}
          />
        ) : (
          <SectionCard
            title="Real tasks"
            action={
              <Link
                to="/app/marketplace"
                className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
              >
                Marketplace
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            }
          >
            {realTasks.length === 0 ? (
              <EmptyRow message="No real tasks available right now." />
            ) : (
              <ul className="divide-y divide-divider">
                {realTasks.slice(0, 5).map((t) => (
                  <TaskRow key={t.id} task={t} locked={!realTasksUnlocked} />
                ))}
              </ul>
            )}
          </SectionCard>
        )}

        <SectionCard
          title="Recent approvals"
          action={
            <Link
              to="/app/earnings"
              className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
            >
              All earnings
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          }
        >
          {latestApprovals.length > 0 ? (
            <ul className="divide-y divide-dashed divide-divider">
              {latestApprovals.map((s) => {
                const date = new Date(s.reviewedAt ?? s.submittedAt)
                  .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  .toUpperCase()
                const earned = s.basePayout + s.bonusPayout
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-2/60"
                  >
                    <div className="w-16 shrink-0 font-mono text-[11px] tracking-stamp uppercase text-ink-3">
                      {date}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-ink truncate">
                        {s.taskTitle}
                      </div>
                      <div className="font-mono text-[10px] tracking-stamp uppercase text-ink-3 mt-0.5">
                        {s.isStarter ? 'Practice · reviewed' : 'Real · YRW reviewed'}
                        <span className="mx-1.5 opacity-40">·</span>
                        #{s.id.slice(0, 6).toUpperCase()}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {s.isStarter ? (
                        <span className="font-mono text-[13px] tracking-stamp uppercase text-ink-2">
                          {s.rating ? `${s.rating}/5` : 'Approved'}
                        </span>
                      ) : (
                        <span className="font-mono text-[14px] tracking-tight text-ink font-semibold">
                          +{formatCurrency(earned)}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyRow message="No approvals yet. Finish a brief to land your first receipt." />
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function StarterRunSection({
  tasks,
  submissions,
  submittedAll,
  reviewedAll,
}: {
  tasks: Task[]
  submissions: Submission[]
  submittedAll: boolean
  reviewedAll: boolean
}) {
  const submittedSet = new Set(submissions.map((s) => s.taskId))
  const totalSubmitted = tasks.filter((t) => submittedSet.has(String(t.id))).length

  return (
    <SectionCard
      title={`Practice · ${totalSubmitted}/${tasks.length}`}
    >
      <ul className="divide-y divide-divider">
        {tasks.map((t) => {
          const sub = submissions.find((s) => s.taskId === t.id)
          const status: 'pending' | 'approved' | 'rejected' | 'not-submitted' = sub
            ? sub.status
            : 'not-submitted'
          const Glyph = PLATFORM_GLYPH[t.platform]
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-bg/60"
            >
              <span className="font-mono text-[11px] font-bold text-brand tabular-nums w-6 shrink-0">
                0{t.starterIndex}
              </span>
              <Glyph size={16} className="text-ink-3 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13.5px] font-medium text-ink truncate">
                  {toneLabel(t.tone)} brief
                </span>
                <span className="text-[12px] text-ink-3 truncate">
                  {t.brief.split('.')[0]}.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {status === 'pending' ? <Stamp tone="pending">In review</Stamp> : null}
                {status === 'approved' ? <Stamp tone="approved" /> : null}
                {status === 'rejected' ? <Stamp tone="rejected" /> : null}
                <Link to={`/app/tasks/${t.id}`}>
                  <Button
                    size="sm"
                    variant={status === 'not-submitted' ? 'primary' : 'ghost'}
                  >
                    {status === 'not-submitted' ? 'Start' : 'View'}
                  </Button>
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      {submittedAll && !reviewedAll ? (
        <div className="border-t border-divider px-5 py-4 bg-info-soft/40">
          <p className="text-[12.5px] text-ink-2 leading-relaxed">
            <span className="font-semibold text-brand">All 5 submitted. </span>
            Reviewed by hand, typically inside 48 hours.
          </p>
        </div>
      ) : null}
    </SectionCard>
  )
}

function TaskRow({
  task,
  locked,
}: {
  task: Task
  locked: boolean
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-5 py-3 transition-colors hover:bg-bg/60',
        locked && 'opacity-60'
      )}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <PlatformTag platform={task.platform} />
          {task.hot ? <RowTag label="Hot" tone="danger" /> : null}
        </div>
        <span className="text-[13.5px] font-medium text-ink truncate">
          Comment on {task.targetHandle}
        </span>
        <span className="text-[12px] text-ink-3 truncate">{task.brief}</span>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="font-mono text-[15px] font-bold text-brand tabular-nums">
          {formatCurrency(task.payRate)}
        </span>
        {locked ? (
          <Button variant="submitted" size="sm" disabled>
            Locked
          </Button>
        ) : (
          <Link to={`/app/tasks/${task.id}`}>
            <Button size="sm">Claim</Button>
          </Link>
        )}
      </div>
    </li>
  )
}
