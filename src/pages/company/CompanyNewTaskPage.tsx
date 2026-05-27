import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Field, Input } from '../../components/ui/primitives'
import {
  getProjectById,
  useProjects,
  type TaskTone,
} from '../../lib/store'
import { cn, formatCurrency } from '../../lib/ui-utils'
import { ChevronBackIcon, TONE_OPTIONS } from './shared'

type TaskFormState = {
  keyword: string
  tone: TaskTone
  totalSlots: string
}

const DEFAULT_TASK_FORM: TaskFormState = {
  keyword: '',
  tone: 'product',
  totalSlots: '10',
}

export function CompanyNewTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addProjectTask } = useProjects()
  const project = id ? getProjectById(id) : undefined

  const [form, setForm] = useState<TaskFormState>(DEFAULT_TASK_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof TaskFormState, string>> = {}
    if (!form.keyword.trim()) e.keyword = 'Required'
    const slots = parseInt(form.totalSlots, 10)
    if (!Number.isInteger(slots) || slots <= 0) e.totalSlots = 'Must be a whole number > 0'
    return e
  }, [form])

  const canSubmit = !!project && Object.keys(errors).length === 0 && !submitting

  function set<K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function blur(key: keyof TaskFormState) {
    setTouched((t) => ({ ...t, [key]: true }))
  }
  function showError(key: keyof TaskFormState) {
    return touched[key] ? errors[key] : undefined
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ keyword: true, tone: true, totalSlots: true })
    if (!canSubmit || !project) return
    setFormError(null)
    setSubmitting(true)
    try {
      await addProjectTask(project.id, {
        keyword: form.keyword.trim(),
        tone: form.tone,
        totalSlots: parseInt(form.totalSlots, 10),
      })
      navigate(`/company/projects/${project.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create task. Please try again.')
      setSubmitting(false)
    }
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[14px] text-ink-2">Project not found.</p>
        <Link to="/company/projects" className="text-brand transition-colors hover:text-brand-deep">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          to={`/company/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-brand"
        >
          <ChevronBackIcon />
          {project.name}
        </Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          New slot batch
        </h1>
        <p className="text-xs text-ink-3 mt-0.5">
          A slot batch is a set of approvals you want on this project's post. Pick the keyword
          workers must include, the tone, and how many slots.
        </p>
      </div>

      <Card className="flex flex-col gap-2 border-divider-warm bg-brand-soft">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-2">Target post</span>
          <a
            href={project.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-[13px] text-brand max-w-[60%] hover:underline"
          >
            {project.targetUrl}
          </a>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-2">Pay rate per approved</span>
          <span className="text-[13px] text-ink font-medium">
            {formatCurrency(project.payRate)}
          </span>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              htmlFor="keyword"
              label="Keyword"
              required
              error={showError('keyword')}
              helper="The word or phrase the comment must include naturally."
            >
              <Input
                id="keyword"
                value={form.keyword}
                onChange={(e) => set('keyword', e.target.value)}
                onBlur={() => blur('keyword')}
                hasError={!!showError('keyword')}
                placeholder="launch day"
              />
            </Field>
            <Field htmlFor="tone" label="Tone">
              <select
                id="tone"
                value={form.tone}
                onChange={(e) => set('tone', e.target.value as TaskTone)}
                className={cn(
                  'w-full rounded-md border border-divider bg-surface px-3.5 py-2.5 text-[14px] text-ink',
                  'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                )}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            htmlFor="totalSlots"
            label="Slots"
            required
            error={showError('totalSlots')}
            helper="How many approved comments you want on this batch."
          >
            <Input
              id="totalSlots"
              type="number"
              min="1"
              step="1"
              value={form.totalSlots}
              onChange={(e) => set('totalSlots', e.target.value)}
              onBlur={() => blur('totalSlots')}
              hasError={!!showError('totalSlots')}
            />
          </Field>
        </Card>

        {formError ? (
          <p className="text-[13px] text-danger" role="alert">{formError}</p>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Link to={`/company/projects/${project.id}`}>
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" disabled={!canSubmit}>
            {submitting ? 'Adding…' : 'Add slot batch'}
          </Button>
        </div>
      </form>
    </div>
  )
}
