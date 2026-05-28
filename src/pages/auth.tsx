import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { AuthLayout } from '../components/layouts'
import { Button, Field, Input, HeadlineWithAccent } from '../components/ui/primitives'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'

function isEmailExistsError(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 400) {
    const p = err.payload as { email?: unknown } | null
    const emailField = p?.email
    if (Array.isArray(emailField) && emailField.some((m) => typeof m === 'string' && /already exists/i.test(m))) {
      return true
    }
  }
  return err instanceof Error && /already exists/i.test(err.message)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Enter your email to continue'
  if (!EMAIL_PATTERN.test(value.trim())) return 'That does not look like a valid email'
  return null
}

function validatePassword(value: string): string | null {
  if (!value) return 'Pick a password'
  if (value.length < 8) return 'Password is at least 8 characters'
  return null
}

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, googleSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [existingEmail, setExistingEmail] = useState<string | null>(null)
  const emailError = touched.email ? validateEmail(email) : null
  const passwordError = touched.password ? validatePassword(password) : null
  const canSubmit = !validateEmail(email) && !validatePassword(password)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!canSubmit) return
    setFormError(null)
    setExistingEmail(null)
    setSubmitting(true)
    try {
      await signup(email.trim(), password)
      navigate('/onboarding/verify-email')
    } catch (err) {
      if (isEmailExistsError(err)) {
        setExistingEmail(email.trim())
        setFormError(null)
      } else {
        setFormError(err instanceof Error ? err.message : 'Could not create your account.')
      }
      setSubmitting(false)
    }
  }

  async function handleGoogleSuccess(resp: CredentialResponse) {
    if (!resp.credential) {
      setFormError('Google did not return a sign-in token.')
      return
    }
    setFormError(null)
    setSubmitting(true)
    try {
      const user = await googleSignIn(resp.credential)
      navigate(user.wizardStep === 'done' ? '/app' : `/onboarding/${user.wizardStep}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed.')
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="Create your account">
      <HeadlineWithAccent
        as="h1"
        text="Real comments, paid by the post."
        accents={['paid']}
        className="font-serif text-[36px] md:text-[40px] leading-[1.05] text-ink tracking-tighter"
      />
      <p className="mt-4 text-[14px] text-ink-2 leading-relaxed">
        Encrypted in transit and at rest. No payment credentials stored. We don&rsquo;t sell your data.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError('Google sign-in was cancelled or failed.')}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            logo_alignment="center"
            width="400"
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] tracking-stamp uppercase text-ink-3 font-mono my-1">
          <span className="flex-1 h-px bg-divider" />
          or
          <span className="flex-1 h-px bg-divider" />
        </div>
      </div>

      {existingEmail ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </span>
          <div className="flex flex-col gap-1 text-[13.5px] text-ink leading-snug">
            <p className="font-semibold">An account with this email already exists.</p>
            <p className="text-ink-2">
              <span className="font-mono text-[12px]">{existingEmail}</span> is already registered. Sign in with that account, or use a different email to create a new one.
            </p>
            <Link
              to={`/login?email=${encodeURIComponent(existingEmail)}`}
              className="mt-1 self-start rounded-md bg-brand px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field htmlFor="email" label="Email" required error={emailError}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (existingEmail) setExistingEmail(null)
            }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            hasError={!!emailError}
            placeholder="you@example.com"
          />
        </Field>
        <Field
          htmlFor="password"
          label="Password"
          required
          helper="At least 8 characters."
          error={passwordError}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            hasError={!!passwordError}
          />
        </Field>

        {formError ? (
          <p className="text-[13px] text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" size="lg" fullWidth disabled={!canSubmit || submitting}>
          Start earning
        </Button>
      </form>

      <p className="mt-6 text-[13px] text-ink-2">
        Already have an account?{' '}
        <Link to="/login" className="text-brand font-medium transition-colors hover:text-brand-deep">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, googleSignIn } = useAuth()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email')?.trim() ?? '')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const emailError = touched.email ? validateEmail(email) : null
  const passwordError = touched.password && !password ? 'Enter your password' : null
  const canSubmit = !validateEmail(email) && password.length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!canSubmit) return
    setFormError(null)
    setSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      navigate(user.wizardStep === 'done' ? '/app' : `/onboarding/${user.wizardStep}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign in failed.')
      setSubmitting(false)
    }
  }

  async function handleGoogleSuccess(resp: CredentialResponse) {
    if (!resp.credential) {
      setFormError('Google did not return a sign-in token.')
      return
    }
    setFormError(null)
    setSubmitting(true)
    try {
      const user = await googleSignIn(resp.credential)
      navigate(user.wizardStep === 'done' ? '/app' : `/onboarding/${user.wizardStep}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Google sign-in failed.')
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back">
      <h1 className="font-serif text-[36px] md:text-[40px] leading-[1.05] text-ink tracking-tighter">
        Sign in to <span className="signature">microchore</span>
      </h1>
      <p className="mt-4 text-[14px] text-ink-2 leading-relaxed">
        Pick up where you left off. Tasks, earnings, and payouts are all on the other side.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError('Google sign-in was cancelled or failed.')}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            logo_alignment="center"
            width="400"
          />
        </div>
        <div className="flex items-center gap-3 text-[11px] tracking-stamp uppercase text-ink-3 font-mono my-1">
          <span className="flex-1 h-px bg-divider" />
          or
          <span className="flex-1 h-px bg-divider" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field htmlFor="login-email" label="Email" required error={emailError}>
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            hasError={!!emailError}
            placeholder="you@example.com"
          />
        </Field>
        <Field htmlFor="login-password" label="Password" required error={passwordError}>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            hasError={!!passwordError}
          />
        </Field>

        {formError ? (
          <p className="text-[13px] text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" size="lg" fullWidth disabled={!canSubmit || submitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-[13px] text-ink-2">
        New here?{' '}
        <Link to="/signup" className="text-brand font-medium transition-colors hover:text-brand-deep">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
