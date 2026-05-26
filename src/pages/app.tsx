import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Eyebrow,
  HeadlineWithAccent,
  RowTag,
  StatCard,
} from '../components/ui/primitives'
import {
  InstagramIcon,
  PlatformTag,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  type Platform,
} from '../components/ui/PlatformTag'
import { Receipt } from '../components/ui/Receipt'
import { Stamp } from '../components/ui/Stamp'
import { ChevronLeftIcon } from '../components/ui/NavIcons'
import {
  useEarnings,
  useSubmissions,
  useTasks,
  type Submission,
  type Task,
} from '../lib/store'
import { apiGetTask } from '../lib/api'
import { useAuth } from '../lib/auth'
import { cn, formatCurrency, formatRelative, usePasteTracker } from '../lib/ui-utils'

const PLATFORM_GLYPH = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
} satisfies Record<Platform, unknown>

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
}

const PLATFORM_DOMAIN: Record<Platform, string> = {
  instagram: 'instagram.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
  x: 'X.com',
}

function toneLabel(tone: Task['tone']) {
  return ({
    lifestyle: 'Lifestyle',
    product: 'Product',
    story: 'Story',
    disagreement: 'Discourse',
    brand: 'Brand',
  } as const)[tone]
}

export function DashboardPage() {
  const { user } = useAuth()
  const tasks = useTasks()
  const { submissions, reviewSubmission } = useSubmissions()

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

  function autoReviewAll() {
    const pending = starterSubs.filter((s) => s.status === 'pending')
    pending.forEach((s) => {
      const goodSignal = s.pastedChars < s.charsTyped && s.text.length >= 24
      void reviewSubmission(
        s.id,
        goodSignal ? 'approved' : 'rejected',
        goodSignal ? 4 : 2,
        goodSignal
          ? 'Reads natural, keyword integrated without effort.'
          : 'Looks pasted, did not meet the bar.',
      )
    })
  }

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

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
        <p className="text-xs text-ink-3 mt-0.5">
          {dateLabel} · {realTasksUnlocked ? 'Cleared for real briefs' : accountOnHold ? 'On hold' : 'Practice run in progress'}
        </p>
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

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {!realTasksUnlocked && !accountOnHold ? (
          <StarterRunSection
            tasks={starterTasks}
            submissions={starterSubs}
            submittedAll={submittedAllStarter}
            reviewedAll={starterReviewedAll}
            onAutoReview={autoReviewAll}
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

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col overflow-hidden bg-surface border border-divider rounded-xl shadow-card">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-divider px-5">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="p-8 flex items-center justify-center text-center">
      <p className="text-[13px] text-ink-3 max-w-[40ch]">{message}</p>
    </div>
  )
}

function StarterRunSection({
  tasks,
  submissions,
  submittedAll,
  reviewedAll,
  onAutoReview,
}: {
  tasks: Task[]
  submissions: Submission[]
  submittedAll: boolean
  reviewedAll: boolean
  onAutoReview?: () => void
}) {
  const submittedSet = new Set(submissions.map((s) => s.taskId))
  const totalSubmitted = tasks.filter((t) => submittedSet.has(String(t.id))).length

  return (
    <SectionCard
      title={`Practice · ${totalSubmitted}/${tasks.length}`}
      action={
        import.meta.env.DEV && onAutoReview ? (
          <button
            type="button"
            onClick={onAutoReview}
            className="inline-flex items-center rounded-md px-2 py-1 -mx-2 -my-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
          >
            Auto-review
          </button>
        ) : null
      }
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

export function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loadingTask, setLoadingTask] = useState(true)
  const { user, updateUser } = useAuth()
  const { addSubmission, submissions } = useSubmissions()
  const existing = submissions.find((s) => s.taskId === id)
  const [text, setText] = useState(existing?.text ?? '')
  const [commentUrl, setCommentUrl] = useState(existing?.commentUrl ?? '')
  const [attestedThoughtful, setAttestedThoughtful] = useState(false)
  const [attestedNoGeneric, setAttestedNoGeneric] = useState(false)
  const attested = attestedThoughtful && attestedNoGeneric
  const [reviewedSubmission, setReviewedSubmission] = useState<Submission | null>(null)
  const { stats, pastedRatio, reset, onPaste } = usePasteTracker(text)
  const counterRef = useRef<HTMLDivElement | null>(null)
  const reviewTimerRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    let cancelled = false
    if (!id) { setLoadingTask(false); return }
    setLoadingTask(true)
    apiGetTask(id)
      .then((t) => {
        if (cancelled) return
        setTask(t)
        setLoadingTask(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoadingTask(false)
      })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (reviewTimerRef.current !== null) {
        window.clearTimeout(reviewTimerRef.current)
        reviewTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (pastedRatio > 80 && counterRef.current) {
      counterRef.current.animate(
        [
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 180, iterations: 1 }
      )
    }
  }, [pastedRatio])

  if (loadingTask) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[14px] text-ink-3">Loading task...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[14px] text-ink-2">Task not found.</p>
        <Link to="/app" className="text-brand transition-colors hover:text-brand-deep">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const isStarter = task.kind === 'starter'
  const keywordPresent = task.keyword
    ? text.toLowerCase().includes(task.keyword.toLowerCase())
    : true
  const keywordError =
    text.trim().length > 0 && !keywordPresent
      ? `Keyword "${task.keyword}" is missing. Include it naturally in your comment.`
      : undefined
  const canSubmit =
    !existing &&
    text.trim().length >= 24 &&
    keywordPresent &&
    /^https?:\/\/.+/.test(commentUrl.trim()) &&
    attested

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || !task) return
    await addSubmission(
      {
        taskId: task.id,
        text: text.trim(),
        commentUrl: commentUrl.trim(),
        pasteCount: stats.pasteCount,
        charsTyped: stats.charsTyped,
        pastedChars: stats.pastedChars,
        elapsedSec: stats.elapsedSec,
        attestationSigned: true,
      },
      isStarter,
    )
    if (user) updateUser({})
    reset()
    setAttestedThoughtful(false)
    setAttestedNoGeneric(false)
    if (isStarter) navigate('/app')
  }

  const PlatformGlyph = PLATFORM_GLYPH[task.platform]
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const charsDone = Math.min(text.length, 24)
  const charsPct = Math.min(100, Math.round((charsDone / 24) * 100))
  const lengthOK = text.length >= 24
  const keywordOK = keywordPresent && text.length > 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          to={isStarter ? "/app" : "/app/marketplace"}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand text-white px-3.5 py-2 text-[13px] font-medium hover:bg-brand-deep transition-colors"
        >
          <ChevronLeftIcon size={16} />
          {isStarter ? "Dashboard" : "Marketplace"}
        </Link>
        <span className="rounded-full bg-surface border border-divider px-3 py-1.5 text-[12px] text-ink-2">
          {task.remaining} remaining tasks
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2 flex-wrap">
        <span>Task: Comment on</span>
        <span className="text-brand">{task.targetHandle}</span>
        <span className="text-[14px] text-ink-3 font-normal">
          (via {PLATFORM_LABEL[task.platform]})
        </span>
        <span className="inline-flex items-center text-ink-2">
          <PlatformGlyph size={20} />
        </span>
      </h1>

      {existing ? (
        <SubmissionCard submission={existing} task={task} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
            <Card className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Reward</span>
                <span className="text-[13px] text-ink font-medium">
                  {formatCurrency(task.payRate)} per approved
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Cadence</span>
                <span className="text-[13px] text-ink font-medium">{task.payoutCadence}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Method</span>
                <span className="text-[13px] text-ink font-medium uppercase">
                  {task.payoutMethod}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Min Payout</span>
                <span className="text-[13px] text-ink font-medium">
                  {formatCurrency(task.payoutMin)}
                </span>
              </div>
            </Card>

            <div className="flex flex-col gap-4 min-w-0">
              <Card className="p-4">
                <p className="text-sm font-medium text-ink mb-3">Target Post</p>
                <a
                  href={task.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-md border border-divider p-3 hover:border-brand transition-colors group"
                >
                  <span className="w-10 h-10 rounded-full bg-brand-50 text-brand flex items-center justify-center shrink-0">
                    <PlatformGlyph size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{task.targetHandle}</p>
                    <p className="text-xs text-ink-3 truncate">{task.targetUrl}</p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
                    className="text-ink-3 group-hover:text-brand shrink-0"
                  >
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </a>
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Your Reply</p>
                  <p className="text-[11px] text-ink-3 font-mono">
                    {text.length} chars · {wordCount} words
                  </p>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onPaste={(e) => { onPaste(e); e.preventDefault() }}
                  onDrop={(e) => e.preventDefault()}
                  placeholder={`Write your reply. Include the keyword "${task.keyword}" naturally.`}
                  rows={6}
                  className={cn(
                    "rounded-md border bg-surface p-3 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-brand",
                    keywordError ? "border-red-300" : "border-divider",
                  )}
                />
                {keywordError ? (
                  <p className="text-xs text-red-600">{keywordError}</p>
                ) : null}
              </Card>
            </div>

            <Card className="p-5 flex flex-col gap-3 self-start">
              <p className="text-sm font-medium text-ink">Submission</p>
              <p className="text-xs text-ink-3">
                Paste your direct comment link to verify.
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-ink-3" htmlFor="commentUrl">
                  Direct Comment Link ({PLATFORM_DOMAIN[task.platform]})
                </label>
                <input
                  id="commentUrl"
                  type="url"
                  value={commentUrl}
                  onChange={(e) => setCommentUrl(e.target.value)}
                  placeholder={`https://${PLATFORM_DOMAIN[task.platform].toLowerCase()}/...`}
                  autoComplete="off"
                  className="rounded-md border border-divider bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as unknown as FormEvent)}
                disabled={!canSubmit}
                className="rounded-md bg-brand text-white px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-deep transition-colors"
              >
                Verify and Submit for Approval
              </button>
              <p className="text-[11px] text-ink-3 text-center">
                {!commentUrl.trim()
                  ? 'Awaiting URL paste'
                  : !canSubmit
                  ? 'Complete the guidelines below'
                  : 'Ready to verify'}
              </p>
            </Card>
          </div>

          <Card className="p-5 flex flex-col gap-3">
            <p className="text-sm font-medium text-ink">Guidelines Checklist</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestedThoughtful}
                  onChange={(e) => setAttestedThoughtful(e.target.checked)}
                  className="mt-1 rounded border-divider"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Thoughtful &amp; On-Topic</span>
                  <span className="text-xs text-ink-3">Real reading, real opinion. Not noise.</span>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestedNoGeneric}
                  onChange={(e) => setAttestedNoGeneric(e.target.checked)}
                  className="mt-1 rounded border-divider"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Avoid Generic Compliments</span>
                  <span className="text-xs text-ink-3">Specific over generic in your reply.</span>
                </span>
              </label>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-medium", lengthOK ? "text-brand" : "text-ink")}>
                    Minimum 24 Characters
                  </span>
                  <span className="text-[11px] text-ink-3 font-mono">{charsDone}/24</span>
                </div>
                <div className="h-1.5 bg-grey-soft rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", lengthOK ? "bg-brand" : "bg-brand-300")}
                    style={{ width: `${charsPct}%` }}
                  />
                </div>
              </div>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={keywordOK}
                  readOnly
                  className="mt-1 rounded border-divider pointer-events-none"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-ink">
                    Keyword Included:{' '}
                    <span className={cn(
                      "font-mono px-1.5 py-0.5 rounded text-[12px]",
                      keywordOK ? "bg-brand-50 text-brand-700" : "bg-grey-soft text-ink-3",
                    )}>
                      "{task.keyword}"
                    </span>
                  </span>
                  <span className="text-xs text-ink-3">
                    {keywordOK ? 'Detected in your reply.' : 'Add it naturally in your reply.'}
                  </span>
                </span>
              </label>
            </div>

            <div
              ref={counterRef}
              className={cn(
                'flex items-center justify-between text-[11px] font-mono tracking-stamp uppercase mt-2 pt-3 border-t border-divider',
                pastedRatio > 80 ? 'text-danger' : 'text-ink-3',
              )}
            >
              <span>
                Typed {stats.charsTyped} · Pasted {stats.pastedChars}
                {stats.elapsedSec ? ` · ${stats.elapsedSec}s` : ''}
              </span>
              <span>
                {pastedRatio > 80
                  ? 'Mostly pasted, auto-flag'
                  : pastedRatio > 30
                  ? 'Some paste detected'
                  : 'Looks like a person wrote this'}
              </span>
            </div>
          </Card>
        </>
      )}

      {reviewedSubmission ? (
        <ApprovalReceiptModal
          submission={reviewedSubmission}
          task={task}
          onClose={() => setReviewedSubmission(null)}
        />
      ) : null}
    </div>
  )
}

function SubmissionCard({
  submission,
  task,
}: {
  submission: Submission
  task: Task
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Eyebrow
          dot
          dotColor={
            submission.status === 'approved'
              ? 'success'
              : submission.status === 'rejected'
              ? 'danger'
              : 'info'
          }
        >
          {submission.status === 'pending'
            ? 'In review'
            : submission.status === 'approved'
            ? 'Approved'
            : 'Rejected'}
        </Eyebrow>
        {submission.status === 'pending' ? <Stamp tone="pending" /> : null}
        {submission.status === 'approved' ? <Stamp tone="approved" /> : null}
        {submission.status === 'rejected' ? <Stamp tone="rejected" /> : null}
      </div>

      <div className="rounded-md border border-divider bg-bg p-4 text-[14px] text-ink leading-relaxed">
        {submission.text}
      </div>

      <div className="grid grid-cols-3 gap-3 text-[12.5px] text-ink-2">
        <div>
          <Eyebrow>Typed</Eyebrow>
          <div className="mt-1 text-ink">{submission.charsTyped} chars</div>
        </div>
        <div>
          <Eyebrow>Pasted</Eyebrow>
          <div className="mt-1 text-ink">{submission.pastedChars} chars</div>
        </div>
        <div>
          <Eyebrow>Submitted</Eyebrow>
          <div className="mt-1 text-ink">{formatRelative(submission.submittedAt)}</div>
        </div>
      </div>

      {submission.status !== 'pending' ? (
        <div className="border-t border-divider pt-4 flex flex-col gap-2">
          <Eyebrow>Reviewer note</Eyebrow>
          <p className="text-[13.5px] text-ink-2 leading-relaxed">
            {submission.justification ?? 'No justification recorded.'}
          </p>
          {submission.status === 'approved' && !submission.isStarter ? (
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-ink-3">
                Rating <span className="text-ink font-medium">{submission.rating}/5</span>
              </span>
              <span className="signature text-[22px] leading-none">
                {formatCurrency(submission.basePayout + submission.bonusPayout)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <a
        href={submission.commentUrl}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 -mx-2 -my-1 text-[13px] text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
      >
        Open comment
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
          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </a>
      <span className="text-[11px] text-ink-3 font-mono tracking-stamp uppercase">
        Task · {task.targetHandle}
      </span>
    </Card>
  )
}

function ApprovalReceiptModal({
  submission,
  task,
  onClose,
}: {
  submission: Submission
  task: Task
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const dismissRef = useRef<HTMLButtonElement | null>(null)
  const titleId = `receipt-${submission.id}-title`

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    dismissRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const root = dialogRef.current
      if (!root) return
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[420px]"
      >
        <h2 id={titleId} className="sr-only">
          Submission approved
        </h2>
        <Receipt
          serial={`#${submission.id.slice(0, 6).toUpperCase()}`}
          header={new Date(submission.reviewedAt ?? submission.submittedAt)
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            .toUpperCase()}
          subHeader={`Rating ${submission.rating ?? '·'}/5`}
          lines={[
            {
              label: `Comment on ${task.targetHandle}`,
              value: formatCurrency(submission.basePayout),
            },
            { label: 'Bonus', value: formatCurrency(submission.bonusPayout) },
          ]}
          total={{
            label: 'Earned',
            value: formatCurrency(submission.basePayout + submission.bonusPayout),
          }}
          footerNote="You did the work. Receipt filed."
          stamp={{ tone: 'approved' }}
          rotate
        />
        <button
          ref={dismissRef}
          onClick={onClose}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[12px] font-mono tracking-stamp uppercase text-ink hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded px-2 py-1"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export function EarningsPage() {
  const earnings = useEarnings()
  const { user } = useAuth()
  const weekly = useMemo(() => groupByWeek(earnings.approved), [earnings.approved])

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
