import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  Field,
  Input,
  RowTag,
  Textarea,
} from '../../components/ui/primitives'
import { PlatformTag } from '../../components/ui/PlatformTag'
import { useAuth } from '../../lib/auth'
import { useSubmissions, useTasks } from '../../lib/store'
import { cn, formatCurrency, safeHref, usePasteTracker } from '../../lib/ui-utils'
import { fireSideCannons } from '../../lib/confetti'
import { haptics } from '../../lib/haptics'
import { StepShell } from './shared'

export function FirstTaskStep() {
  const navigate = useNavigate()
  const { advanceWizard } = useAuth()
  const { addSubmission } = useSubmissions()
  const tasks = useTasks()
  const task = tasks.find((t) => t.kind === 'starter')
  const [text, setText] = useState('')
  const [commentUrl, setCommentUrl] = useState('')
  const [attested, setAttested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { stats, pastedRatio, onPaste } = usePasteTracker(text)
  const counterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!counterRef.current) return
    if (pastedRatio > 80) {
      counterRef.current.animate(
        [
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 180, iterations: 1 }
      )
    } else if (pastedRatio > 30) {
      counterRef.current.animate(
        [
          { transform: 'translateX(-1px)' },
          { transform: 'translateX(1px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 120, iterations: 1 }
      )
    }
  }, [pastedRatio])

  if (!task) return null

  const canSubmit =
    text.trim().length >= 24 &&
    /^https?:\/\/.+/.test(commentUrl.trim()) &&
    attested &&
    !submitting &&
    !done

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting || done) return
    if (!canSubmit || !task) return
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
        true,
      )
      setDone(true)
      fireSideCannons(1500)
      haptics.success()
      window.setTimeout(() => {
        advanceWizard()
        navigate('/app')
      }, 1600)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your first task. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <StepShell
      eyebrow="Final step · 90% done"
      title="One task. Real review. Within 48 hours."
      accents={['real review']}
      intro="Last thing before the dashboard. The platform team reads it personally and writes a one-line note. Four more practice tasks unlock on the dashboard once you submit."
    >
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PlatformTag platform={task.platform} />
            <RowTag label={task.tone} tone="accent" />
          </div>
          <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
            Posting from your linked account
          </span>
        </div>
        <div>
          <Eyebrow>Brief</Eyebrow>
          <p className="mt-2 text-sm text-ink leading-relaxed">{task.brief}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-2">
            Keyword:{' '}
            <span className="font-mono text-ink bg-accent-soft px-2 py-0.5 rounded">
              {task.keyword}
            </span>
          </span>
          {(() => {
            const targetHref = safeHref(task.targetUrl)
            return targetHref ? (
              <a
                href={targetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand transition-colors hover:text-brand-deep"
              >
                Open target post
              </a>
            ) : (
              <span className="text-ink-3">No target link</span>
            )
          })()}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          htmlFor="comment"
          label="Your comment"
          required
          helper={
            text.length === 0
              ? 'Aim for a complete thought. Minimum 24 characters.'
              : `${text.trim().length}/24 characters`
          }
        >
          <Textarea
            id="comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={onPaste}
            placeholder="Write your comment in your own voice..."
          />
        </Field>
        <div
          ref={counterRef}
          className={cn(
            'flex items-center justify-between text-xs font-mono tracking-stamp uppercase',
            pastedRatio > 80 ? 'text-danger' : 'text-ink-3'
          )}
        >
          <span>
            Typed {stats.charsTyped} chars &middot; Pasted {stats.pastedChars} chars
            {stats.elapsedSec ? ` · ${stats.elapsedSec}s` : ''}
          </span>
          <span>
            {pastedRatio > 80
              ? 'Mostly pasted, this will auto-flag'
              : pastedRatio > 30
              ? 'Some paste detected'
              : 'Looks like a person wrote this'}
          </span>
        </div>

        <Field
          htmlFor="commentUrl"
          label="Comment URL"
          required
          helper="Post the comment first, then paste the URL here."
        >
          <Input
            id="commentUrl"
            type="url"
            value={commentUrl}
            onChange={(e) => setCommentUrl(e.target.value)}
            placeholder="https://instagram.com/p/.../c/..."
            autoComplete="off"
          />
        </Field>

        <Checkbox
          id="first-attest"
          checked={attested}
          onChange={(e) => setAttested(e.target.checked)}
          label="I wrote this in my own voice without AI assistance."
        />

        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <span className="text-xs text-ink-3">
            Pay rate on practice tasks is set internally. Real-rate tasks unlock after review.
          </span>
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {submitting ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Submitting
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
        {submitError ? (
          <p className="text-xs text-danger" role="alert">{submitError}</p>
        ) : null}
      </form>

      <p className="text-xs text-ink-3">
        Real tasks at {formatCurrency(0.5)} unlock after the practice tasks are reviewed.
      </p>
    </StepShell>
  )
}
