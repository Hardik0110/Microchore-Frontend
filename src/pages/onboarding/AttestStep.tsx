import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Checkbox } from '../../components/ui/primitives'
import { WIZARD_ROUTES, useAuth, wizardNext } from '../../lib/auth'
import { StepShell } from './shared'

export function AttestStep() {
  const navigate = useNavigate()
  const { user, updateUser, advanceWizard } = useAuth()
  const [adult, setAdult] = useState(false)
  const [noAi, setNoAi] = useState(false)
  const [terms, setTerms] = useState(false)
  const allChecked = adult && noAi && terms

  function go() {
    updateUser({ attestedAt: new Date().toISOString() })
    const nextStep = user ? wizardNext(user.wizardStep) : 'tutorial'
    advanceWizard()
    navigate(WIZARD_ROUTES[nextStep])
  }

  return (
    <StepShell
      eyebrow="Attestation · Almost there"
      title="Three things we ask, plainly."
      accents={['plainly']}
      intro="Four steps down, two to go. These keep the bar high and protect you if a brief ever goes wrong."
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
