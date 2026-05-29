import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  apiCreateReview,
  apiGetReviewerQueue,
  type ReviewerQueueItem,
} from '../../lib/api'
import { Card } from '../../components/ui/primitives'
import { safeHref } from '../../lib/ui-utils'

type Rating = 1 | 2 | 3 | 4 | 5

const RATING_OPTIONS: Rating[] = [1, 2, 3, 4, 5]

export function ReviewerQueuePage() {
  const [queue, setQueue] = useState<ReviewerQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [rating, setRating] = useState<Rating | null>(null)
  const [justification, setJustification] = useState('')
  const [feelsAi, setFeelsAi] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number>(() => Date.now())
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false)

  const loadQueue = useCallback(() => {
    setLoading(true)
    return apiGetReviewerQueue(20)
      .then((rows) => {
        setQueue(rows)
        setLoading(false)
        setHasFetchedOnce(true)
      })
      .catch((err: unknown) => {
        setLoading(false)
        setHasFetchedOnce(true)
        if (err instanceof ApiError && err.status === 403) {
          setAccessError('You are not a reviewer. Ask an admin to grant reviewer status.')
        } else {
          setAccessError(err instanceof Error ? err.message : 'Could not load the queue.')
        }
      })
  }, [])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const current = queue[0]

  useEffect(() => {
    if (!current) return
    setStartedAt(Date.now())
  }, [current?.id])

  useEffect(() => {
    if (!hasFetchedOnce) return
    if (queue.length > 0) return
    if (accessError) return
    if (loading) return
    loadQueue()
  }, [queue.length, hasFetchedOnce, accessError, loading, loadQueue])

  function resetForm() {
    setRating(null)
    setJustification('')
    setFeelsAi(false)
    setSubmitError(null)
  }

  async function handleSubmit() {
    if (!current || rating === null) return
    if (justification.trim().length < 30) {
      setSubmitError('Justification must be at least 30 characters.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      await apiCreateReview(current.id, {
        rating,
        justification_text: justification.trim(),
        feels_ai_flag: feelsAi,
        time_taken_seconds: elapsed,
      })
      setQueue((prev) => prev.slice(1))
      resetForm()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setSubmitError(err.detail || 'Could not save review.')
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Could not save review.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Header remaining={queue.length} />

      {loading ? (
        <Card className="p-6 text-sm text-ink-3">Loading queue…</Card>
      ) : accessError ? (
        <Card className="p-6 flex flex-col gap-2">
          <p className="text-sm text-ink">{accessError}</p>
          <p className="text-xs text-ink-3">Once granted reviewer status (T1, T2, or ADMIN), refresh this page.</p>
        </Card>
      ) : !current ? (
        <Card className="p-6 flex flex-col gap-2">
          <p className="text-sm text-ink">No pending submissions to review right now.</p>
          <p className="text-xs text-ink-3">Check back in a few minutes as workers submit comments.</p>
        </Card>
      ) : (
        <>
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3">
              <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 font-medium">
                {current.taskTitle}
              </span>
              <span className="rounded-full bg-ghost-soft text-ink-2 px-2.5 py-1">
                tone: {current.taskTone}
              </span>
              <span className="text-ink-3">@{current.commentAccountHandle}</span>
            </div>

            <Field label="Target post">
              {(() => {
                const href = safeHref(current.targetUrl)
                return href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline break-all">
                    {current.targetUrl}
                  </a>
                ) : (
                  <span className="text-sm text-ink-3 break-all">{current.targetUrl || '(no target)'}</span>
                )
              })()}
            </Field>

            <Field label="Keyword required">
              <p className="text-sm text-ink font-medium">{current.keyword || '(none)'}</p>
            </Field>

            <Field label="Comment text">
              <div className="rounded-md border border-divider bg-bg p-3 text-sm text-ink whitespace-pre-wrap">
                {current.text}
              </div>
            </Field>

            <Field label="Comment URL">
              {(() => {
                const href = safeHref(current.commentUrl)
                return href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline break-all">
                    {current.commentUrl}
                  </a>
                ) : (
                  <span className="text-sm text-ink-3 break-all">{current.commentUrl || '(none)'}</span>
                )
              })()}
            </Field>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-ink-3">
              <Stat label="Elapsed (s)" value={String(current.elapsedSec)} />
              <Stat label="Pastes" value={String(current.pasteCount)} />
              <Stat label="Chars typed" value={String(current.charsTyped)} />
              <Stat label="Chars pasted" value={String(current.pastedChars)} />
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-ink">Rate this comment</p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={
                    'rounded-md px-4 py-2 text-sm font-medium border transition ' +
                    (rating === r
                      ? 'bg-brand text-white border-brand'
                      : 'bg-surface text-ink border-divider hover:border-brand-300')
                  }
                >
                  {r}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={feelsAi}
                onChange={(e) => setFeelsAi(e.target.checked)}
                className="rounded border-divider"
              />
              Reads like an AI-generated comment
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-3 uppercase tracking-wide" htmlFor="justification">
                Justification (min 30 chars)
              </label>
              <textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="rounded-md border border-divider bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Explain the rating in plain language. What worked, what didn't, why."
              />
              <p className="text-xs text-ink-3 text-right">{justification.trim().length}/30</p>
            </div>

            {submitError ? <p className="text-sm text-danger" role="alert">{submitError}</p> : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || rating === null || justification.trim().length < 30}
              className="self-start rounded-md bg-brand text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-deep transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </Card>
        </>
      )}
    </div>
  )
}

function Header({ remaining }: { remaining: number }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Reviewer queue</p>
      <h1 className="font-serif text-3xl text-ink tracking-tighter">Grade one submission at a time.</h1>
      <p className="text-sm text-ink-3">
        {remaining > 0
          ? `${remaining} submission${remaining === 1 ? '' : 's'} in your queue.`
          : 'Three independent reviews finalize each task.'}
      </p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-ink-3 uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ghost-soft/40 px-3 py-2 flex flex-col">
      <span className="text-ink-3 uppercase tracking-wide">{label}</span>
      <span className="text-ink font-medium text-sm">{value}</span>
    </div>
  )
}
