import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Eyebrow, RowTag } from '../../components/ui/primitives'
import { PlatformTag } from '../../components/ui/PlatformTag'
import { Stamp } from '../../components/ui/Stamp'
import { WIZARD_ROUTES, useAuth, wizardNext } from '../../lib/auth'
import { cn } from '../../lib/ui-utils'
import { StepShell } from './shared'

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
    const nextStep = user ? wizardNext(user.wizardStep) : 'first-task'
    advanceWizard()
    navigate(WIZARD_ROUTES[nextStep])
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
