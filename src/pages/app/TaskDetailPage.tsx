import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, Eyebrow } from '../../components/ui/primitives'
import { Stamp } from '../../components/ui/Stamp'
import { ChevronLeftIcon } from '../../components/ui/NavIcons'
import { useSubmissions, type Submission, type Task } from '../../lib/store'
import { apiGetTask } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { cn, formatCurrency, formatRelative, safeHref, usePasteTracker } from '../../lib/ui-utils'
import { PLATFORM_DOMAIN, PLATFORM_GLYPH, PLATFORM_LABEL } from './shared'

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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const attested = attestedThoughtful && attestedNoGeneric
  const { stats, pastedRatio, reset } = usePasteTracker(text)
  const counterRef = useRef<HTMLDivElement | null>(null)

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
        <p className="text-sm text-ink-3">Loading task...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-2">Task not found.</p>
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
    if (!canSubmit || !task || submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          className="inline-flex items-center gap-1.5 rounded-full bg-brand text-white px-3.5 py-2 text-sm font-medium hover:bg-brand-deep transition-colors"
        >
          <ChevronLeftIcon size={16} />
          {isStarter ? "Dashboard" : "Marketplace"}
        </Link>
        <span className="rounded-full bg-surface border border-divider px-3 py-1.5 text-xs text-ink-2">
          {task.remaining} remaining tasks
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-2 flex-wrap">
        <span>Task: Comment on</span>
        <span className="text-brand">{task.targetHandle}</span>
        <span className="text-sm text-ink-3 font-normal">
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
                <span className="text-sm text-ink-2">Reward</span>
                <span className="text-sm text-ink font-medium">
                  {formatCurrency(task.payRate)} per approved
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-2">Cadence</span>
                <span className="text-sm text-ink font-medium">{task.payoutCadence}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-2">Method</span>
                <span className="text-sm text-ink font-medium uppercase">
                  {task.payoutMethod}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-2">Min Payout</span>
                <span className="text-sm text-ink font-medium">
                  {formatCurrency(task.payoutMin)}
                </span>
              </div>
            </Card>

            <div className="flex flex-col gap-4 min-w-0">
              <Card className="p-4">
                <p className="text-sm font-medium text-ink mb-3">Target Post</p>
                {(() => {
                  const targetHref = safeHref(task.targetUrl)
                  const inner = (
                    <>
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
                    </>
                  )
                  return targetHref ? (
                    <a
                      href={targetHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-md border border-divider p-3 hover:border-brand transition-colors group"
                    >
                      {inner}
                    </a>
                  ) : (
                    <span className="flex items-center gap-3 rounded-md border border-divider p-3">
                      {inner}
                    </span>
                  )
                })()}
              </Card>

              <Card className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Type your reply</p>
                  <p className="text-xs text-ink-3 font-mono">
                    {text.length} chars · {wordCount} words
                  </p>
                </div>
                <p className="text-xs text-ink-3">
                  Pasting is disabled. We track typing for quality, so write in your own voice.
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
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
                disabled={!canSubmit || submitting}
                className="rounded-md bg-brand text-white px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-deep transition-colors"
              >
                {submitting ? 'Submitting…' : 'Verify and Submit for Approval'}
              </button>
              {submitError ? (
                <p className="text-xs text-danger" role="alert">{submitError}</p>
              ) : null}
              <p className="text-xs text-ink-3 text-center">
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
                  <span className="text-xs text-ink-3 font-mono">{charsDone}/24</span>
                </div>
                <div className="h-1.5 bg-ghost-soft rounded-full overflow-hidden">
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
                      "font-mono px-1.5 py-0.5 rounded text-xs",
                      keywordOK ? "bg-brand-50 text-brand-700" : "bg-ghost-soft text-ink-3",
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
                'flex items-center justify-between text-xs font-mono tracking-stamp uppercase mt-2 pt-3 border-t border-divider',
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

      <div className="rounded-md border border-divider bg-bg p-4 text-sm text-ink leading-relaxed">
        {submission.text}
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-ink-2">
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
          <p className="text-sm text-ink-2 leading-relaxed">
            {submission.justification ?? 'No justification recorded.'}
          </p>
          {submission.status === 'approved' && !submission.isStarter ? (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-ink-3">
                Rating <span className="text-ink font-medium">{submission.rating}/5</span>
              </span>
              <span className="signature text-xl leading-none">
                {formatCurrency(submission.basePayout + submission.bonusPayout)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {(() => {
        const commentHref = safeHref(submission.commentUrl)
        return commentHref ? (
          <a
            href={commentHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 -mx-2 -my-1 text-sm text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
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
        ) : null
      })()}
      <span className="text-xs text-ink-3 font-mono tracking-stamp uppercase">
        Task · {task.targetHandle}
      </span>
    </Card>
  )
}

