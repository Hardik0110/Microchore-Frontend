import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  Field,
  HeadlineWithAccent,
  Input,
  ProgressBar,
  RowTag,
  StatCard,
} from '../components/ui/primitives'
import { PlatformTag } from '../components/ui/PlatformTag'
import { Stamp } from '../components/ui/Stamp'
import { useAuth } from '../lib/auth'
import { useEarnings, useSubmissions, resetMockData } from '../lib/store'
import { useTheme, type ThemeMode } from '../lib/theme'
import { cn, formatCurrency, formatStampDate } from '../lib/ui-utils'

export function ProfilePage() {
  const { user } = useAuth()
  const earnings = useEarnings()
  const { submissions } = useSubmissions()
  const starterSubs = submissions.filter((s) => s.isStarter)
  const starterApproved = starterSubs.filter((s) => s.status === 'approved').length
  const starterRejected = starterSubs.filter((s) => s.status === 'rejected').length

  if (!user) return null

  const memberSince = formatStampDate(user.createdAt)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <HeadlineWithAccent
          as="h1"
          text="Your account, plainly."
          accents={['plainly']}
          className="font-serif text-[48px] md:text-[60px] leading-[1.02] tracking-tighter font-normal text-ink"
        />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-2 md:col-span-2">
          <Eyebrow>Identity</Eyebrow>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-2">
            <Detail label="Email" value={user.email} />
            <Detail label="Member since" value={memberSince} />
            <Detail label="Country" value={user.country ?? 'Not set'} />
            <Detail
              label="Account status"
              value={user.holdReason ? 'On hold' : user.realTasksUnlocked ? 'Active' : 'Onboarding'}
              tone={user.holdReason ? 'danger' : user.realTasksUnlocked ? 'success' : 'info'}
            />
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <Eyebrow>Total earned</Eyebrow>
          <div className="signature text-[36px] leading-none">
            {formatCurrency(earnings.totalEarned)}
          </div>
          <div className="text-[12px] text-ink-3">
            Across {earnings.approvedCount} approved tasks · Avg rating{' '}
            {earnings.averageRating ? earnings.averageRating.toFixed(2) : '·'}
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[18px] font-medium text-ink">Linked account</h2>
        {user.linkedAccount ? (
          <Card className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <PlatformTag platform={user.linkedAccount.platform} size={20} />
              <div className="flex flex-col">
                <span className="text-[16px] text-ink font-medium">{user.linkedAccount.handle}</span>
                <span className="text-[12px] text-ink-3">
                  Verified {formatStampDate(user.linkedAccount.verifiedAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-[13px] text-ink-2">
              <Stat label="Followers" value={user.linkedAccount.followers.toLocaleString()} />
              <Stat label="Posts" value={user.linkedAccount.posts.toLocaleString()} />
              <Stat label="Age" value={`${user.linkedAccount.ageDays}d`} />
            </div>
          </Card>
        ) : (
          <Card>
            <Eyebrow>No account linked</Eyebrow>
            <p className="mt-2 text-[14px] text-ink-2">
              Link a social account in onboarding to start receiving briefs that match it.
            </p>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-[18px] font-medium text-ink">Practice tasks</h2>
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-ink">
              {starterApproved} approved · {starterRejected} rejected ·{' '}
              {Math.max(0, starterSubs.length - starterApproved - starterRejected)} pending
            </span>
            {starterApproved + starterRejected >= 5 ? (
              <Stamp tone={user.realTasksUnlocked ? 'approved' : 'rejected'}>
                {user.realTasksUnlocked ? 'Passed' : 'Held'}
              </Stamp>
            ) : (
              <Stamp tone="pending">In progress</Stamp>
            )}
          </div>
          <ProgressBar value={starterApproved + starterRejected} total={5} segments />
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Approved" value={earnings.approvedCount} />
        <StatCard label="Pending" value={earnings.pendingCount} />
        <StatCard label="Rejected" value={earnings.rejectedCount} />
        <StatCard
          label="Avg rating"
          value={earnings.averageRating ? earnings.averageRating.toFixed(2) : '·'}
        />
      </section>

      <div className="flex items-center justify-end">
        <Link to="/app/settings">
          <Button variant="ghost">Open settings</Button>
        </Link>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'success' | 'danger' | 'info' | 'neutral'
}) {
  return (
    <div className="flex flex-col gap-1">
      <Eyebrow>{label}</Eyebrow>
      {tone ? (
        <RowTag label={value} tone={tone} />
      ) : (
        <span className="text-[14px] text-ink">{value}</span>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-right">
      <Eyebrow>{label}</Eyebrow>
      <span className="text-[16px] text-ink font-medium">{value}</span>
    </div>
  )
}

type PayoutMethod = 'airtm' | 'paypal' | 'crypto'

const PAYOUT_LABELS: Record<PayoutMethod, string> = {
  airtm: 'Airtm',
  paypal: 'PayPal',
  crypto: 'Crypto wallet',
}

const PAYOUT_PLACEHOLDERS: Record<PayoutMethod, string> = {
  airtm: 'your.airtm.handle',
  paypal: 'you@paypal.example',
  crypto: '0x... or wallet address',
}

const USER_KEY = 'microchore:user'

function readPayoutFromStorage(): { method: PayoutMethod | ''; handle: string } {
  if (typeof window === 'undefined') return { method: '', handle: '' }
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    if (!raw) return { method: '', handle: '' }
    const obj = JSON.parse(raw) as { payoutMethod?: PayoutMethod; payoutHandle?: string }
    return { method: obj.payoutMethod ?? '', handle: obj.payoutHandle ?? '' }
  } catch {
    return { method: '', handle: '' }
  }
}

function writePayoutToStorage(method: PayoutMethod, handle: string) {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return
  try {
    const obj = JSON.parse(raw)
    obj.payoutMethod = method
    obj.payoutHandle = handle
    window.localStorage.setItem(USER_KEY, JSON.stringify(obj))
  } catch { }
}

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const THEME_HINTS: Record<ThemeMode, string> = {
  light: 'Paper white. The default look.',
  dark: 'Low light. Easier on the eyes after hours.',
  system: 'Follows your device setting.',
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { mode: themeMode, setMode: setThemeMode } = useTheme()
  const initial = readPayoutFromStorage()
  const [method, setMethod] = useState<PayoutMethod | ''>(initial.method)
  const [handle, setHandle] = useState(initial.handle)
  const [discordOptIn, setDiscordOptIn] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushApproval, setPushApproval] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  function savePayout() {
    if (!method || !handle.trim()) return
    writePayoutToStorage(method, handle.trim())
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }

  function handleResetData() {
    resetMockData()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_KEY)
      window.location.href = '/'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <HeadlineWithAccent
          as="h1"
          text="How you get paid, contacted, and remembered."
          accents={['paid', 'remembered']}
          className="font-serif text-[48px] md:text-[60px] leading-[1.02] tracking-tighter font-normal text-ink"
        />
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-ink">Payout</h2>
          <p className="text-[13px] text-ink-2 mt-1">
            Microchore never holds money. YRW pays you directly via the method you choose. We only
            store the handle.
          </p>
        </div>
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(PAYOUT_LABELS) as PayoutMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  'rounded-lg border px-4 py-4 text-left transition-colors',
                  method === m
                    ? 'border-ink bg-surface'
                    : 'border-divider bg-surface hover:border-ink-3'
                )}
              >
                <Eyebrow dot={method === m}>{PAYOUT_LABELS[m]}</Eyebrow>
                <div className="mt-2 text-[12px] text-ink-3 leading-snug">
                  {m === 'airtm' && 'Global, low fees, used by most workers.'}
                  {m === 'paypal' && 'Faster in the US and EU.'}
                  {m === 'crypto' && 'USDC or similar stablecoin on a wallet you control.'}
                </div>
              </button>
            ))}
          </div>

          {method ? (
            <Field
              htmlFor="payout-handle"
              label={`Your ${PAYOUT_LABELS[method]} handle`}
              helper="Stored only. Never displayed publicly."
            >
              <Input
                id="payout-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={PAYOUT_PLACEHOLDERS[method]}
                autoComplete="off"
              />
            </Field>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-success">
              {saved ? 'Saved. We will use this on your next approved task.' : ''}
            </span>
            <Button onClick={savePayout} disabled={!method || !handle.trim()}>
              Save payout
            </Button>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-ink">Appearance</h2>
          <p className="text-[13px] text-ink-2 mt-1">
            Light, dark, or whatever your device prefers.
          </p>
        </div>
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(THEME_LABELS) as ThemeMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setThemeMode(m)}
                className={cn(
                  'rounded-lg border px-4 py-4 text-left transition-colors',
                  themeMode === m
                    ? 'border-ink bg-surface'
                    : 'border-divider bg-surface hover:border-ink-3'
                )}
              >
                <Eyebrow dot={themeMode === m}>{THEME_LABELS[m]}</Eyebrow>
                <div className="mt-2 text-[12px] text-ink-3 leading-snug">{THEME_HINTS[m]}</div>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-ink">Notifications</h2>
          <p className="text-[13px] text-ink-2 mt-1">
            Light touch. We only ping you when there is something to read.
          </p>
        </div>
        <Card className="flex flex-col gap-5">
          <Checkbox
            id="opt-discord"
            checked={discordOptIn}
            onChange={(e) => setDiscordOptIn(e.target.checked)}
            label="Join the in-platform Discord"
            helper="Worker-only space, moderated by Microchore. Good for swapping briefs."
          />
          <Checkbox
            id="opt-email"
            checked={emailDigest}
            onChange={(e) => setEmailDigest(e.target.checked)}
            label="Weekly earnings digest by email"
            helper="One email on Sunday with your approvals and payout status."
          />
          <Checkbox
            id="opt-push"
            checked={pushApproval}
            onChange={(e) => setPushApproval(e.target.checked)}
            label="Email me when a submission is reviewed"
            helper="Approval or rejection, with the reviewer note."
          />
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[18px] font-medium text-ink">Account</h2>
        </div>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[14px] text-ink">Signed in as</span>
              <div className="text-[12px] text-ink-3">{user.email}</div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                logout()
                navigate('/', { replace: true })
              }}
            >
              Sign out
            </Button>
          </div>
        </Card>

        {import.meta.env.DEV ? (
          <Card className="flex flex-col gap-3 border-danger">
            <Eyebrow dot dotColor="danger">Preview build only</Eyebrow>
            <p className="text-[13px] text-ink-2 leading-relaxed">
              This control is hidden in production. It clears the mock user, tasks, and submissions
              in this browser so you can walk the flow again from scratch.
            </p>
            {confirming ? (
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleResetData}>
                  Yes, wipe and reload
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button variant="danger" onClick={() => setConfirming(true)}>
                  Reset preview data
                </Button>
              </div>
            )}
          </Card>
        ) : null}
      </section>
    </div>
  )
}
