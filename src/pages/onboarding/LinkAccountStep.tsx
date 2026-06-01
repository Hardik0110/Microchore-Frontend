import {
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { apiLinkInstagram, apiLinkYouTube, apiTwitterStartLink } from '../../lib/api'
import { Button, Card, Eyebrow, Field, Input } from '../../components/ui/primitives'
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '../../components/ui/PlatformTag'
import { WIZARD_ROUTES, useAuth, wizardNext, type LinkedAccount, type Platform } from '../../lib/auth'
import { cn } from '../../lib/ui-utils'
import { StepShell } from './shared'

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

export function LinkAccountStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard, refreshUser } = useAuth()
  const [platform, setPlatform] = useState<Platform>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('twitter')) return 'x'
    }
    return user?.linkedAccount?.platform ?? 'youtube'
  })
  const [verifying, setVerifying] = useState(false)
  const [twitterPending, setTwitterPending] = useState(false)
  const [igHandle, setIgHandle] = useState('')
  const [igPending, setIgPending] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (params.get('twitter') === 'error') {
      return 'Twitter sign-in failed. Try again.'
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

  async function connectInstagram() {
    const handle = igHandle.trim().replace(/^@/, '')
    if (!handle) {
      setOauthError('Enter your Instagram username.')
      return
    }
    setOauthError(null)
    setIgPending(true)
    try {
      const { linkedAccount } = await apiLinkInstagram(handle)
      setResult(linkedAccount)
      if (linkedAccount.passesCredibility) {
        updateUser({ linkedAccount, handle: linkedAccount.handle })
      }
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : 'Could not link your Instagram account.')
    } finally {
      setIgPending(false)
    }
  }

  async function connectTwitter() {
    setOauthError(null)
    setTwitterPending(true)
    try {
      const { authorize_url } = await apiTwitterStartLink()
      let parsed: URL
      try {
        parsed = new URL(authorize_url)
      } catch {
        setOauthError('Twitter returned an invalid sign-in URL.')
        setTwitterPending(false)
        return
      }
      const allowedHosts = new Set([
        'twitter.com',
        'www.twitter.com',
        'mobile.twitter.com',
        'x.com',
        'www.x.com',
        'mobile.x.com',
        'api.twitter.com',
        'api.x.com',
      ])
      if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname.toLowerCase())) {
        setOauthError('Twitter returned an unexpected sign-in URL.')
        setTwitterPending(false)
        return
      }
      window.location.href = parsed.href
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : 'Could not start Twitter sign-in.')
      setTwitterPending(false)
    }
  }

  const thresholds = PLATFORM_THRESHOLDS[platform]

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

  function handleContinue() {
    if (!result?.passesCredibility) return
    let returnTo: string | null = null
    try {
      returnTo = window.sessionStorage.getItem('microchore:link-return')
    } catch { void 0 }
    if (returnTo) {
      try {
        window.sessionStorage.removeItem('microchore:link-return')
      } catch { void 0 }
      navigate(returnTo)
      return
    }
    if (user?.wizardStep === 'done') {
      navigate('/app/profile')
      return
    }
    const nextStep = user ? wizardNext(user.wizardStep) : 'attest'
    advanceWizard()
    navigate(WIZARD_ROUTES[nextStep])
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
                    'font-mono text-2xs tracking-stamp uppercase',
                    isLinked ? 'text-success' : 'text-ink-3',
                  )}
                >
                  {cfg.name}
                </span>
              </div>
              <div className="text-xs text-ink-2 leading-snug">
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
              <p className="text-sm text-ink-2 leading-relaxed">
                Sign in with Google and grant read-only access to your YouTube channel. We read your
                channel name, subscriber count, video count, and channel age. Nothing else.
              </p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
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
                <p className="text-xs text-danger" role="alert">
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
              <p className="text-sm text-ink-2 leading-relaxed">
                Sign in with Twitter and grant read-only access. We read your handle, follower
                count, tweet count, and account age. Nothing else.
              </p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
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
                <p className="text-xs text-danger" role="alert">
                  {oauthError}
                </p>
              ) : null}
            </div>
          </Card>
        )
      ) : platform === 'instagram' ? (
        user?.linkedAccount?.platform === 'instagram' && user.linkedAccount.passesCredibility ? null : (
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!igPending) connectInstagram()
              }}
              className="flex flex-col gap-3"
            >
              <Eyebrow>Link your Instagram account</Eyebrow>
              <p className="text-sm text-ink-2 leading-relaxed">
                Enter your public Instagram username. We verify the profile exists and read your
                handle, follower count, post count, and account age. Nothing else.
              </p>
              <Field htmlFor="ig-handle" label="Instagram username" required>
                <Input
                  id="ig-handle"
                  type="text"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  placeholder="your.handle"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </Field>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
                  Public profile lookup
                </span>
                <Button type="submit" disabled={igPending || !igHandle.trim()} variant="ghost">
                  {igPending ? 'Verifying...' : 'Verify Instagram'}
                </Button>
              </div>
              {oauthError ? (
                <p className="text-xs text-danger" role="alert">
                  {oauthError}
                </p>
              ) : null}
            </form>
          </Card>
        )
      ) : (
        <Card>
          <div className="flex flex-col gap-3">
            <Eyebrow>{thresholds.name} linking is coming soon</Eyebrow>
            <p className="text-sm text-ink-2 leading-relaxed">
              Handle verification for {thresholds.name} is moving server-side. To continue onboarding right
              now, link your YouTube or Twitter account instead. You can add {thresholds.name} later from
              your profile.
            </p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
                Link via YouTube or Twitter
              </span>
              <Button
                onClick={() => {
                  setOauthError(null)
                  setPlatform('youtube')
                }}
                variant="ghost"
              >
                Switch to YouTube
              </Button>
            </div>
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
                <span className="font-mono text-xs text-ink-3">{result.handle}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
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
                <p className="text-sm text-ink-2">
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
                <span className="font-mono text-xs text-ink-3">{result.handle}</span>
              </div>
              <p className="text-sm text-ink-2">
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
      <span className={cn('text-xl font-medium', ok ? 'text-ink' : 'text-danger')}>
        {value}
      </span>
      <span className="text-xs text-ink-3">Needs {required}</span>
    </div>
  )
}
