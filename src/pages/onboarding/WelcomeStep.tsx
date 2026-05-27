import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../../components/ui/primitives'
import { WIZARD_ROUTES, useAuth, wizardNext } from '../../lib/auth'
import { cn } from '../../lib/ui-utils'
import { StepShell } from './shared'

export function WelcomeStep() {
  const navigate = useNavigate()
  const { user, advanceWizard } = useAuth()
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
    const nextStep = user ? wizardNext(user.wizardStep) : 'link-account'
    advanceWizard()
    navigate(WIZARD_ROUTES[nextStep])
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
      <Card className="flex items-center gap-3 border-info/40 bg-info/10 p-4">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info/20 text-info">
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
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </span>
        <p className="text-[13px] text-ink-2 leading-snug">
          Heads up: email verification is coming soon. We have activated your account for now so you can keep moving.
        </p>
      </Card>

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
