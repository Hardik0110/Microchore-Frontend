import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '../../components/ui/primitives'
import { apiConfirmEmailVerify, apiRequestEmailVerify } from '../../lib/api'
import { WIZARD_ROUTES, useAuth, wizardNext } from '../../lib/auth'
import { StepShell } from './shared'

export function VerifyEmailStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard } = useAuth()
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const valid = /^\d{6}$/.test(code)
  const formatError = touched && !valid ? 'Enter the 6-digit code from your email' : null

  useEffect(() => {
    if (user?.emailVerified) return
    let cancelled = false
    setRequesting(true)
    apiRequestEmailVerify()
      .catch(() => {
        if (!cancelled) setServerError('Could not request a verification code. Try resending.')
      })
      .finally(() => {
        if (!cancelled) setRequesting(false)
      })
    return () => { cancelled = true }
  }, [user?.emailVerified])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid || submitting) return
    setServerError(null)
    setSubmitting(true)
    try {
      const fresh = await apiConfirmEmailVerify(code)
      updateUser({ emailVerified: fresh.emailVerified, wizardStep: fresh.wizardStep })
      const nextStep = user ? wizardNext(user.wizardStep) : 'welcome'
      advanceWizard()
      navigate(WIZARD_ROUTES[nextStep])
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Invalid or expired code.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setServerError(null)
    setRequesting(true)
    try {
      await apiRequestEmailVerify()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not resend code.')
    } finally {
      setRequesting(false)
    }
  }

  const error = serverError ?? formatError

  return (
    <StepShell
      eyebrow="Verify email"
      title="Check your inbox."
      accents={['inbox']}
      intro={
        <>
          We sent a 6-digit code to <span className="text-ink font-medium">{user?.email}</span>.
          Paste it below.
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          htmlFor="code"
          label="6-digit code"
          required
          error={error}
          helper="The code expires in 10 minutes."
        >
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => setTouched(true)}
            hasError={!!error}
            placeholder="000000"
            className="font-mono tracking-[0.4em] text-center text-[22px] py-3"
          />
        </Field>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleResend}
            disabled={requesting}
            className="text-[13px] text-brand transition-colors hover:text-brand-deep disabled:opacity-50"
          >
            {requesting ? 'Sending…' : 'Send another code'}
          </button>
          <Button type="submit" disabled={!valid || submitting}>
            {submitting ? 'Verifying…' : 'Continue'}
          </Button>
        </div>
      </form>
    </StepShell>
  )
}
