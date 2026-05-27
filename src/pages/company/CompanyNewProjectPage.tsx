import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Field, Input, Textarea } from '../../components/ui/primitives'
import { useProjects } from '../../lib/store'
import { ChevronBackIcon } from './shared'

type ProjectFormState = {
  companyName: string
  name: string
  description: string
  targetUrl: string
  payRate: string
}

const DEFAULT_PROJECT_FORM: ProjectFormState = {
  companyName: 'YRW Technologies',
  name: '',
  description: '',
  targetUrl: '',
  payRate: '0.20',
}

const URL_PATTERN = /^https?:\/\/.+/i

export function CompanyNewProjectPage() {
  const navigate = useNavigate()
  const { addProject } = useProjects()
  const [form, setForm] = useState<ProjectFormState>(DEFAULT_PROJECT_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProjectFormState, string>> = {}
    if (!form.companyName.trim()) e.companyName = 'Required'
    if (!form.name.trim()) e.name = 'Project name is required'
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'At least 20 characters'
    if (!URL_PATTERN.test(form.targetUrl.trim())) e.targetUrl = 'Must be a valid URL'
    const pay = parseFloat(form.payRate)
    if (!Number.isFinite(pay) || pay <= 0) e.payRate = 'Must be greater than 0'
    return e
  }, [form])

  const canSubmit = Object.keys(errors).length === 0 && !submitting

  function set<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function blur(key: keyof ProjectFormState) {
    setTouched((t) => ({ ...t, [key]: true }))
  }
  function showError(key: keyof ProjectFormState) {
    return touched[key] ? errors[key] : undefined
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ companyName: true, name: true, description: true, targetUrl: true, payRate: true })
    if (!canSubmit) return
    setFormError(null)
    setSubmitting(true)
    try {
      const created = await addProject({
        companyName: form.companyName.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        targetUrl: form.targetUrl.trim(),
        payRate: parseFloat(form.payRate),
      })
      navigate(`/company/projects/${created.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create project. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          to="/company/projects"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-brand"
        >
          <ChevronBackIcon />
          Projects
        </Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          New project
        </h1>
        <p className="text-xs text-ink-3 mt-0.5">
          A project is one post on one platform with one pay rate. Add slot batches underneath, each
          with its own keyword and tone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Card className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold text-ink">About the project</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              htmlFor="companyName"
              label="Company name"
              required
              error={showError('companyName')}
            >
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
                onBlur={() => blur('companyName')}
                hasError={!!showError('companyName')}
              />
            </Field>
            <Field htmlFor="name" label="Project name" required error={showError('name')}>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => blur('name')}
                hasError={!!showError('name')}
                placeholder="Spring product reveal"
              />
            </Field>
          </div>
          <Field
            htmlFor="description"
            label="Description"
            required
            error={showError('description')}
            helper="Project-level context. Tone, brand voice, anything that applies across all tasks."
          >
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              onBlur={() => blur('description')}
              hasError={!!showError('description')}
              placeholder="Friendly, personal, no sales-speak. We are looking for comments that read like fans, not bots."
            />
          </Field>
          <Field
            htmlFor="targetUrl"
            label="Target post URL"
            required
            error={showError('targetUrl')}
            helper="The post workers will comment under. Platform is inferred from the URL."
          >
            <Input
              id="targetUrl"
              type="url"
              value={form.targetUrl}
              onChange={(e) => set('targetUrl', e.target.value)}
              onBlur={() => blur('targetUrl')}
              hasError={!!showError('targetUrl')}
              placeholder="https://x.com/handle/status/..."
            />
          </Field>
          <Field
            htmlFor="payRate"
            label="Pay rate per approved comment"
            required
            error={showError('payRate')}
            helper="USD. Same rate applies to every slot batch under this project."
          >
            <Input
              id="payRate"
              type="number"
              step="0.01"
              min="0"
              value={form.payRate}
              onChange={(e) => set('payRate', e.target.value)}
              onBlur={() => blur('payRate')}
              hasError={!!showError('payRate')}
            />
          </Field>
        </Card>

        {formError ? (
          <p className="text-[13px] text-danger" role="alert">{formError}</p>
        ) : null}
        <div className="flex items-center justify-end gap-3">
          <Link to="/company/projects">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" disabled={!canSubmit}>
            {submitting ? 'Creating…' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
