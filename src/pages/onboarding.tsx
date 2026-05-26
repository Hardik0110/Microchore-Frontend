import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { apiLinkYouTube, apiTwitterStartLink } from '../lib/api'
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  Field,
  HeadlineWithAccent,
  Input,
  RowTag,
  Textarea,
} from '../components/ui/primitives'
import {
  InstagramIcon,
  PlatformTag,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '../components/ui/PlatformTag'
import { Stamp } from '../components/ui/Stamp'
import { useAuth, type LinkedAccount, type Platform } from '../lib/auth'
import { useSubmissions, useTasks } from '../lib/store'
import { cn, formatCurrency, usePasteTracker } from '../lib/ui-utils'

type StepShellProps = {
  eyebrow: string
  title: string
  accents?: string[]
  intro?: ReactNode
  children: ReactNode
}

function StepShell({ eyebrow, title, accents = [], intro, children }: StepShellProps) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <Eyebrow dot>{eyebrow}</Eyebrow>
        <HeadlineWithAccent
          as="h1"
          text={title}
          accents={accents}
          className="mt-3 font-serif text-[40px] md:text-[48px] leading-[1.05] tracking-tighter font-normal text-ink"
        />
      </div>
      {intro ? <div className="text-[15px] text-ink-2 leading-relaxed">{intro}</div> : null}
      <div className="mt-2 flex flex-col gap-6">{children}</div>
    </section>
  )
}

export function VerifyEmailStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard } = useAuth()
  const [code, setCode] = useState('')
  const [touched, setTouched] = useState(false)
  const valid = /^\d{6}$/.test(code)
  const error = touched && !valid ? 'Enter the 6-digit code from your email' : null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    updateUser({ emailVerified: true })
    advanceWizard()
    navigate('/onboarding/welcome')
  }

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
            onClick={() => updateUser({})}
            className="text-[13px] text-brand transition-colors hover:text-brand-deep"
          >
            Send another code
          </button>
          <Button type="submit" disabled={!valid}>
            Continue
          </Button>
        </div>
      </form>
    </StepShell>
  )
}

export function WelcomeStep() {
  const navigate = useNavigate()
  const { advanceWizard } = useAuth()
  const steps = useMemo(
    () => [
      { label: 'Link your social account', time: '2 min' },
      { label: 'Accept the rules', time: '30 sec' },
      { label: 'Walk the tutorial', time: '3 min' },
      { label: 'Do your first task', time: '5 min' },
    ],
    []
  )

  function go() {
    advanceWizard()
    navigate('/onboarding/link-account')
  }

  return (
    <StepShell
      eyebrow="Welcome"
      title="Most people finish in ten minutes."
      accents={['ten minutes']}
      intro={
        <>
          Here is what is coming. You can pause anywhere and pick up where you left off. Your first
          five tasks are personally reviewed by the platform team, typically within 48 hours.
        </>
      }
    >
      <Card className="p-0 overflow-hidden">
        <ul>
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={cn(
                'flex items-center justify-between px-6 py-4',
                i < steps.length - 1 && 'border-b border-divider'
              )}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3 w-6">
                  0{i + 1}
                </span>
                <span className="text-[14px] text-ink">{s.label}</span>
              </span>
              <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                {s.time}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-center justify-end">
        <Button size="lg" onClick={go}>
          Continue
        </Button>
      </div>
    </StepShell>
  )
}

const PLATFORM_THRESHOLDS: Record<
  Platform,
  { name: string; followers: number; posts: number; ageDays: number; postsLabel: string }
> = {
  instagram: { name: 'Instagram', followers: 100, posts: 10, ageDays: 90, postsLabel: 'posts' },
  youtube: { name: 'YouTube', followers: 100, posts: 5, ageDays: 60, postsLabel: 'videos' },
  tiktok: { name: 'TikTok', followers: 100, posts: 5, ageDays: 60, postsLabel: 'videos' },
  x: { name: 'Twitter', followers: 100, posts: 10, ageDays: 60, postsLabel: 'tweets' },
}

const PLATFORM_ICONS: Record<Platform, (p: { size?: number; className?: string }) => ReactElement> = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
}

function pseudoRandomBetween(seed: string, min: number, max: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return min + (h % Math.max(1, max - min + 1))
}

function deriveVerifyCode(seed: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += alphabet[h % alphabet.length]
    h = (h * 31 + 7) >>> 0
  }
  return `${out.slice(0, 3)}-${out.slice(3)}`
}

export function LinkAccountStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard, refreshUser } = useAuth()
  const [platform, setPlatform] = useState<Platform>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('twitter')) return 'x'
    }
    return user?.linkedAccount?.platform ?? 'instagram'
  })
  const [handle, setHandle] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [twitterPending, setTwitterPending] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter') === 'error') {
      return params.get('detail') || 'Twitter sign-in failed.'
    }
    return null
  })
  const [result, setResult] = useState<LinkedAccount | null>(user?.linkedAccount ?? null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const twitterStatus = params.get('twitter')
    if (!twitterStatus) return
    if (twitterStatus === 'linked') {
      refreshUser().then((u) => {
        if (u?.linkedAccount) setResult(u.linkedAccount)
      })
    }
    window.history.replaceState({}, '', window.location.pathname)
  }, [refreshUser])

  async function connectTwitter() {
    setOauthError(null)
    setTwitterPending(true)
    try {
      const { authorize_url } = await apiTwitterStartLink()
      window.location.href = authorize_url
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : 'Could not start Twitter sign-in.')
      setTwitterPending(false)
    }
  }

  const thresholds = PLATFORM_THRESHOLDS[platform]
  const verifyCode = useMemo(() => deriveVerifyCode(String(user?.id ?? 'guest')), [user?.id])

  const connectYouTube = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setOauthError(null)
      setVerifying(true)
      try {
        const { linkedAccount } = await apiLinkYouTube(tokenResponse.access_token)
        setResult(linkedAccount)
        if (linkedAccount.passesCredibility) {
          updateUser({ linkedAccount, handle: linkedAccount.handle })
        }
      } catch (err) {
        setOauthError(
          err instanceof Error ? err.message : 'Could not link your YouTube channel.',
        )
      } finally {
        setVerifying(false)
      }
    },
    onError: () => setOauthError('Google sign-in was cancelled or failed.'),
  })

  async function handleVerify() {
    if (!handle.trim()) return
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 850))
    const cleaned = handle.replace(/^@/, '').trim()
    const followers = pseudoRandomBetween(`${cleaned}|f`, 40, 8000)
    const posts = pseudoRandomBetween(`${cleaned}|p`, 1, 80)
    const ageDays = pseudoRandomBetween(`${cleaned}|a`, 20, 600)
    const passes =
      platform === 'instagram'
        ? followers >= thresholds.followers &&
          posts >= thresholds.posts &&
          ageDays >= thresholds.ageDays
        : true
    const linked: LinkedAccount = {
      platform,
      handle: `@${cleaned}`,
      followers,
      posts,
      ageDays,
      verifiedAt: new Date().toISOString(),
      passesCredibility: passes,
    }
    setResult(linked)
    if (passes) updateUser({ linkedAccount: linked, handle: linked.handle })
    setVerifying(false)
  }

  function handleContinue() {
    if (!result?.passesCredibility) return
    advanceWizard()
    navigate('/onboarding/attest')
  }

  return (
    <StepShell
      eyebrow="Link account"
      title="Pick the account you will comment from."
      accents={['comment from']}
      intro="We verify ownership with a quick scrape. Each project tells you which platform it needs. You can link more later."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {(Object.keys(PLATFORM_THRESHOLDS) as Platform[]).map((p) => {
          const isActive = platform === p
          const isLinked =
            user?.linkedAccount?.platform === p && user.linkedAccount.passesCredibility
          const Icon = PLATFORM_ICONS[p]
          const cfg = PLATFORM_THRESHOLDS[p]
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPlatform(p)
                setOauthError(null)
              }}
              className={cn(
                'relative rounded-lg border px-3 py-3 text-left transition-colors flex flex-col gap-2',
                isLinked
                  ? 'border-success bg-success/5 ring-1 ring-success'
                  : isActive
                    ? 'border-ink bg-surface ring-1 ring-ink'
                    : 'border-divider bg-surface hover:border-ink-3',
              )}
            >
              {isLinked ? (
                <span
                  aria-hidden
                  className="absolute top-2 right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-success text-white"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <Icon
                  size={18}
                  className={cn(
                    'shrink-0',
                    isLinked ? 'text-success' : isActive ? 'text-ink' : 'text-ink-2',
                  )}
                />
                <span
                  className={cn(
                    'font-mono text-[10px] tracking-stamp uppercase',
                    isLinked ? 'text-success' : 'text-ink-3',
                  )}
                >
                  {cfg.name}
                </span>
              </div>
              <div className="text-[11.5px] text-ink-2 leading-snug">
                {p === 'instagram' ? (
                  <>
                    <div>{cfg.followers}+ followers</div>
                    <div>{cfg.posts}+ {cfg.postsLabel}</div>
                    <div>{cfg.ageDays}+ days</div>
                  </>
                ) : (
                  <div className="text-ink-3">{isLinked ? 'Linked' : 'No minimums'}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {platform === 'youtube' ? (
        user?.linkedAccount?.platform === 'youtube' && user.linkedAccount.passesCredibility ? null : (
          <Card>
            <div className="flex flex-col gap-3">
              <Eyebrow>Link your YouTube channel</Eyebrow>
              <p className="text-[13px] text-ink-2 leading-relaxed">
                Sign in with Google and grant read-only access to your YouTube channel. We read your
                channel name, subscriber count, video count, and channel age. Nothing else.
              </p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                  YouTube Data API · read-only
                </span>
                <Button
                  onClick={() => connectYouTube()}
                  disabled={verifying}
                  variant="ghost"
                >
                  {verifying ? 'Connecting...' : 'Connect with Google'}
                </Button>
              </div>
              {oauthError ? (
                <p className="text-[12px] text-danger" role="alert">
                  {oauthError}
                </p>
              ) : null}
            </div>
          </Card>
        )
      ) : platform === 'x' ? (
        user?.linkedAccount?.platform === 'x' && user.linkedAccount.passesCredibility ? null : (
          <Card>
            <div className="flex flex-col gap-3">
              <Eyebrow>Link your Twitter account</Eyebrow>
              <p className="text-[13px] text-ink-2 leading-relaxed">
                Sign in with Twitter and grant read-only access. We read your handle, follower
                count, tweet count, and account age. Nothing else.
              </p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                  Twitter OAuth 2.0 · read-only
                </span>
                <Button
                  onClick={connectTwitter}
                  disabled={twitterPending}
                  variant="ghost"
                >
                  {twitterPending ? 'Connecting...' : 'Connect with Twitter'}
                </Button>
              </div>
              {oauthError ? (
                <p className="text-[12px] text-danger" role="alert">
                  {oauthError}
                </p>
              ) : null}
            </div>
          </Card>
        )
      ) : (
        <Card>
          <Field
            htmlFor="handle"
            label={`Your ${thresholds.name} handle`}
            required
            helper="We will scrape your bio to confirm ownership. Code expires in 10 minutes."
          >
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@your.handle"
              autoComplete="off"
            />
          </Field>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
              Code: <span className="text-ink">{verifyCode}</span>
            </span>
            <Button onClick={handleVerify} disabled={!handle || verifying} variant="ghost">
              {verifying ? 'Verifying...' : 'Verify ownership'}
            </Button>
          </div>
        </Card>
      )}

      {result ? (
        (() => {
          const resultThresholds = PLATFORM_THRESHOLDS[result.platform]
          return result.platform === 'instagram' ? (
            <Card
              className={cn(
                'flex flex-col gap-3',
                result.passesCredibility ? 'border-success' : 'border-danger'
              )}
            >
              <div className="flex items-center justify-between">
                <Eyebrow dot dotColor={result.passesCredibility ? 'success' : 'danger'}>
                  {result.passesCredibility ? 'Account verified' : 'Account not ready'}
                </Eyebrow>
                <span className="font-mono text-[11px] text-ink-3">{result.handle}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[13px]">
                <CredibilityStat
                  label="Followers"
                  value={result.followers.toLocaleString()}
                  ok={result.followers >= resultThresholds.followers}
                  required={`${resultThresholds.followers}+`}
                />
                <CredibilityStat
                  label={resultThresholds.postsLabel}
                  value={result.posts.toLocaleString()}
                  ok={result.posts >= resultThresholds.posts}
                  required={`${resultThresholds.posts}+`}
                />
                <CredibilityStat
                  label="Account age"
                  value={`${result.ageDays}d`}
                  ok={result.ageDays >= resultThresholds.ageDays}
                  required={`${resultThresholds.ageDays}d`}
                />
              </div>
              {!result.passesCredibility ? (
                <p className="text-[13px] text-ink-2">
                  Your {resultThresholds.name} account is not quite at the bar yet. You can link a
                  different account, or come back when this one grows.
                </p>
              ) : null}
            </Card>
          ) : (
            <Card className="flex flex-col gap-3 border-success">
              <div className="flex items-center justify-between">
                <Eyebrow dot dotColor="success">
                  {resultThresholds.name} connected
                </Eyebrow>
                <span className="font-mono text-[11px] text-ink-3">{result.handle}</span>
              </div>
              <p className="text-[13px] text-ink-2">
                Your {resultThresholds.name} account is linked. Ready to continue.
              </p>
            </Card>
          )
        })()
      ) : null}

      <div className="flex items-center justify-end">
        <Button size="lg" onClick={handleContinue} disabled={!result?.passesCredibility}>
          Continue
        </Button>
      </div>
    </StepShell>
  )
}

function CredibilityStat({
  label,
  value,
  ok,
  required,
}: {
  label: string
  value: string
  ok: boolean
  required: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      <span className={cn('text-[20px] font-medium', ok ? 'text-ink' : 'text-danger')}>
        {value}
      </span>
      <span className="text-[11px] text-ink-3">Needs {required}</span>
    </div>
  )
}

export function AttestStep() {
  const navigate = useNavigate()
  const { updateUser, advanceWizard } = useAuth()
  const [adult, setAdult] = useState(false)
  const [noAi, setNoAi] = useState(false)
  const [terms, setTerms] = useState(false)
  const allChecked = adult && noAi && terms

  function go() {
    updateUser({ attestedAt: new Date().toISOString() })
    advanceWizard()
    navigate('/onboarding/tutorial')
  }

  return (
    <StepShell
      eyebrow="Attestation"
      title="Three things we ask, plainly."
      accents={['plainly']}
      intro="These keep the bar high and protect you if a brief ever goes wrong."
    >
      <Card className="flex flex-col gap-5">
        <Checkbox
          id="atst-adult"
          checked={adult}
          onChange={(e) => setAdult(e.target.checked)}
          label="I am 18 years or older."
          helper="Required because briefs may be paid into accounts that need adult verification."
        />
        <Checkbox
          id="atst-no-ai"
          checked={noAi}
          onChange={(e) => setNoAi(e.target.checked)}
          label="I will write comments in my own voice, without AI assistance."
          helper="The platform tracks paste-vs-type and reviewers flag generated text. Three offenses bans the account."
        />
        <Checkbox
          id="atst-terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          label="I accept that each project will show its terms before I claim a task."
          helper="Pay rate, cadence, and payout method live on the project, not the platform."
        />
      </Card>

      <div className="flex items-center justify-end">
        <Button size="lg" onClick={go} disabled={!allChecked}>
          Continue
        </Button>
      </div>
    </StepShell>
  )
}

type TutorialScreen = {
  title: string
  body: ReactNode
  illustration?: ReactNode
  accents: string[]
}

export function TutorialStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard } = useAuth()
  const [idx, setIdx] = useState(0)
  const handle = user?.linkedAccount?.handle ?? '@your.handle'

  const screens = useMemo<TutorialScreen[]>(
    () => [
      {
        title: 'Each task names the post and the keyword.',
        body:
          'You will see the brief, the linked post, and one English word that must integrate naturally. You write the comment in our composer.',
        illustration: <TutBriefMock />,
        accents: ['integrate'],
      },
      {
        title: 'The composer tracks paste vs type.',
        body:
          'Pasting most of a comment auto-flags the submission. Light edits and corrections are fine. Type your work; the platform notices.',
        illustration: <TutComposerMock />,
        accents: ['composer'],
      },
      {
        title: 'You attest, you post, you submit the URL.',
        body: `Comment from ${handle}. Paste the comment URL back into the platform. We re-fetch it at 24 and 48 hours.`,
        illustration: <TutAttestMock />,
        accents: ['attest'],
      },
      {
        title: 'Reviews land within 48 hours.',
        body:
          'Your first five tasks are personally reviewed by the platform team. After that, three anonymous reviewers score every submission on a one-to-five scale.',
        illustration: <TutReviewMock />,
        accents: ['48 hours', 'platform team'],
      },
      {
        title: 'Earnings appear when a real task is approved.',
        body:
          'Pay rate, cadence, and threshold are set by the project and shown before you claim. YRW pays workers directly. Microchore tracks and exports the report.',
        illustration: <TutEarningsMock />,
        accents: ['real task is approved'],
      },
    ],
    [handle]
  )

  function next() {
    if (idx < screens.length - 1) {
      setIdx((i) => i + 1)
      return
    }
    updateUser({ tutorialCompletedAt: new Date().toISOString() })
    advanceWizard()
    navigate('/onboarding/first-task')
  }

  function prev() {
    if (idx > 0) setIdx((i) => i - 1)
  }

  const screen = screens[idx]

  return (
    <StepShell
      eyebrow={`Tutorial ${idx + 1} / ${screens.length}`}
      title={screen.title}
      accents={screen.accents}
      intro={screen.body}
    >
      {screen.illustration ? <div>{screen.illustration}</div> : null}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={idx === 0}>
          Back
        </Button>
        <Button size="lg" onClick={next}>
          {idx < screens.length - 1 ? 'Next' : 'Start first task'}
        </Button>
      </div>
    </StepShell>
  )
}

function TutBriefMock() {
  return (
    <Card className="bg-bg p-5">
      <Eyebrow dot dotColor="accent">Brief preview</Eyebrow>
      <div className="mt-3 text-[14px] text-ink leading-relaxed">
        Reply to <span className="font-mono">@yrw.brand_drop</span>. Keyword{' '}
        <span className="signature signature-underline">morning</span> should feel natural.
      </div>
      <div className="mt-4 flex items-center gap-3">
        <PlatformTag platform="instagram" />
        <RowTag label="14 left" tone="accent" />
        <span className="ml-auto signature text-[18px] leading-none">$0.50</span>
      </div>
    </Card>
  )
}

function TutComposerMock() {
  return (
    <Card className="bg-bg">
      <Eyebrow>Composer preview</Eyebrow>
      <div className="mt-3 rounded-md border border-divider bg-surface p-4 text-[13px] text-ink-2">
        Truly love this combo for a slow morning. The keyword fits without effort.
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono tracking-stamp uppercase text-ink-3">
        <span>Typed 86 chars &middot; Pasted 0</span>
        <span className="text-success">Looks like a person wrote this</span>
      </div>
    </Card>
  )
}

function TutAttestMock() {
  return (
    <Card className="bg-bg flex flex-col gap-3">
      <Eyebrow>Submit checklist</Eyebrow>
      <ul className="text-[13px] text-ink-2 flex flex-col gap-2">
        <li>1. Post the comment from your linked handle</li>
        <li>2. Paste the comment URL into Microchore</li>
        <li>3. Tick the &ldquo;my own voice&rdquo; attestation</li>
      </ul>
    </Card>
  )
}

function TutReviewMock() {
  return (
    <Card className="bg-bg flex items-center justify-between">
      <div>
        <Eyebrow dot dotColor="info">In review</Eyebrow>
        <div className="mt-1 text-[13px] text-ink">
          Reviewed by the platform team, typically within 48h.
        </div>
      </div>
      <Stamp tone="pending" />
    </Card>
  )
}

function TutEarningsMock() {
  return (
    <Card className="bg-bg">
      <Eyebrow>Earnings preview</Eyebrow>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Tile label="Approved" value="6" />
        <Tile label="Pending" value="2" />
        <Tile label="Earned" value="$3.40" accent />
      </div>
    </Card>
  )
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-divider bg-surface px-3 py-3 flex flex-col gap-1.5">
      <Eyebrow>{label}</Eyebrow>
      <span className={cn('text-[18px] leading-none', accent ? 'signature' : 'text-ink font-medium')}>
        {value}
      </span>
    </div>
  )
}

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
  const { stats, pastedRatio, onPaste } = usePasteTracker(text)
  const counterRef = useRef<HTMLDivElement | null>(null)

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

  if (!task) return null

  const canSubmit =
    text.trim().length >= 24 &&
    /^https?:\/\/.+/.test(commentUrl.trim()) &&
    attested &&
    !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || !task) return
    setSubmitting(true)
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
    advanceWizard()
    navigate('/app')
  }

  return (
    <StepShell
      eyebrow="First task"
      title="One task. Real review. Within 48 hours."
      accents={['real review']}
      intro="The platform team reads it personally and writes a one-line note. Four more practice tasks unlock on the dashboard once you submit."
    >
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PlatformTag platform={task.platform} />
            <RowTag label={task.tone} tone="accent" />
          </div>
          <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
            Posting from your linked account
          </span>
        </div>
        <div>
          <Eyebrow>Brief</Eyebrow>
          <p className="mt-2 text-[14px] text-ink leading-relaxed">{task.brief}</p>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-ink-2">
            Keyword:{' '}
            <span className="font-mono text-ink bg-accent-soft px-2 py-0.5 rounded">
              {task.keyword}
            </span>
          </span>
          <a
            href={task.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand transition-colors hover:text-brand-deep"
          >
            Open target post
          </a>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          htmlFor="comment"
          label="Your comment"
          required
          helper="Aim for a complete thought. Minimum 24 characters."
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
            'flex items-center justify-between text-[11px] font-mono tracking-stamp uppercase',
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

        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] text-ink-3">
            Pay rate on practice tasks is set internally. Real-rate tasks unlock after review.
          </span>
          <Button type="submit" size="lg" disabled={!canSubmit}>
            Submit
          </Button>
        </div>
      </form>

      <p className="text-[12px] text-ink-3">
        Real tasks at {formatCurrency(0.5)} unlock after the practice tasks are reviewed.
      </p>
    </StepShell>
  )
}
