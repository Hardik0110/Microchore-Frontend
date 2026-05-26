import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Field,
  HeadlineWithAccent,
  Input,
  StatCard,
  Textarea,
} from '../components/ui/primitives'
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  type Platform,
} from '../components/ui/PlatformTag'
import {
  getProjectById,
  useProjects,
  useSubmissions,
  useTasks,
  type Project,
  type ProjectTaskInput,
  type TaskPlatform,
  type TaskTone,
} from '../lib/store'
import { cn, formatCurrency, formatRelative } from '../lib/ui-utils'

const PLATFORM_GLYPH = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
} satisfies Record<Platform, unknown>

const PLATFORM_OPTIONS: { value: TaskPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'x', label: 'Twitter' },
]

const TONE_OPTIONS: { value: TaskTone; label: string }[] = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'product', label: 'Product' },
  { value: 'story', label: 'Story' },
  { value: 'disagreement', label: 'Discourse' },
  { value: 'brand', label: 'Brand' },
]

const CADENCE_OPTIONS: ProjectTaskInput['payoutCadence'][] = ['weekly', 'biweekly', 'monthly']
const METHOD_OPTIONS: ProjectTaskInput['payoutMethod'][] = ['paypal', 'airtm', 'crypto', 'any']

function StatusPill({ status }: { status: Project['status'] }) {
  const tone =
    status === 'active'
      ? 'bg-success/15 text-success border-success/30'
      : status === 'paused'
      ? 'bg-warning/15 text-warning border-warning/40'
      : 'bg-muted text-ink-3 border-divider'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em]',
        tone
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'active'
            ? 'bg-success'
            : status === 'paused'
            ? 'bg-warning'
            : 'bg-ink-3'
        )}
        aria-hidden
      />
      {status}
    </span>
  )
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ChevronBackIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function CompanyDashboardPage() {
  const { projects } = useProjects()
  const tasks = useTasks()
  const { submissions } = useSubmissions()

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length
    const projectTasks = tasks.filter((t) => t.kind === 'real' && t.projectId)
    const totalSlots = projectTasks.reduce((acc, t) => acc + t.total, 0)
    const realSubs = submissions.filter((s) => !s.isStarter)
    const pending = realSubs.filter((s) => s.status === 'pending').length
    const approved = realSubs.filter((s) => s.status === 'approved').length
    return {
      activeProjects: active,
      totalProjects: projects.length,
      tasks: projectTasks.length,
      totalSlots,
      pending,
      approved,
    }
  }, [projects, tasks, submissions])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Company dashboard
          </h1>
          <p className="text-xs text-ink-3 mt-0.5">
            {stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'} ·{' '}
            {stats.tasks} {stats.tasks === 1 ? 'task' : 'tasks'} · {stats.pending} awaiting review
          </p>
        </div>
        <Link to="/company/projects/new">
          <Button size="md">
            <PlusIcon />
            New project
          </Button>
        </Link>
      </div>

      <section
        aria-label="Company stats"
        className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
      >
        <StatCard
          label="Active projects"
          value={stats.activeProjects}
          accent
          hint={`${stats.totalProjects} total`}
        />
        <StatCard
          label="Tasks live"
          value={stats.tasks}
          hint={`${stats.totalSlots} slots`}
        />
        <StatCard
          label="Pending review"
          value={stats.pending}
          hint="Submissions awaiting"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          accent
          hint="All time"
        />
      </section>

      <ProjectsCard projects={projects.slice(0, 5)} tasks={tasks} showAllLink />
    </div>
  )
}

export function CompanyProjectsListPage() {
  const { projects } = useProjects()
  const tasks = useTasks()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Projects</h1>
          <p className="text-xs text-ink-3 mt-0.5">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}. Each project can
            hold any number of tasks across different platforms.
          </p>
        </div>
        <Link to="/company/projects/new">
          <Button size="md">
            <PlusIcon />
            New project
          </Button>
        </Link>
      </div>
      <ProjectsCard projects={projects} tasks={tasks} />
    </div>
  )
}

function ProjectsCard({
  projects,
  tasks,
  showAllLink,
}: {
  projects: Project[]
  tasks: ReturnType<typeof useTasks>
  showAllLink?: boolean
}) {
  return (
    <div className="flex flex-col overflow-hidden bg-surface border border-divider rounded-xl shadow-card">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-divider px-5">
        <h3 className="text-[14px] font-semibold text-ink">
          {showAllLink ? 'Recent projects' : 'All projects'}
        </h3>
        {showAllLink && projects.length > 0 ? (
          <Link
            to="/company/projects"
            className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft hover:text-brand-deep"
          >
            All projects
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        ) : null}
      </div>
      {projects.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-[13px] text-ink-3 max-w-[40ch]">
            No projects yet. Create your first project, then add tasks under it.
          </p>
          <Link to="/company/projects/new">
            <Button size="sm">Create a project</Button>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-divider">
          {projects.map((p) => {
            const projectTasks = tasks.filter((t) => t.projectId === p.id)
            return (
              <li key={p.id}>
                <Link
                  to={`/company/projects/${p.id}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-bg/60"
                >
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <span className="text-[14px] font-medium text-ink truncate">
                      {p.name || 'Untitled project'}
                    </span>
                    <span className="text-[12px] text-ink-3 truncate">
                      {p.companyName} · {p.description.split('\n')[0].slice(0, 80)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono text-[14px] font-bold text-brand tabular-nums">
                        {projectTasks.length}
                      </span>
                      <span className="text-[10.5px] text-ink-3 font-mono uppercase tracking-[0.1em]">
                        {projectTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

type ProjectFormState = {
  companyName: string
  name: string
  description: string
}

const DEFAULT_PROJECT_FORM: ProjectFormState = {
  companyName: 'YRW Technologies',
  name: '',
  description: '',
}

export function CompanyNewProjectPage() {
  const navigate = useNavigate()
  const { addProject } = useProjects()
  const [form, setForm] = useState<ProjectFormState>(DEFAULT_PROJECT_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProjectFormState, string>> = {}
    if (!form.companyName.trim()) e.companyName = 'Required'
    if (!form.name.trim()) e.name = 'Project name is required'
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'At least 20 characters'
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ companyName: true, name: true, description: true })
    if (!canSubmit) return
    setSubmitting(true)
    const created = addProject({
      companyName: form.companyName.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    })
    navigate(`/company/projects/${created.id}`)
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
          A project is the umbrella. After you create it, add tasks underneath. Each task can
          target a different platform, post, and keyword.
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
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to="/company/projects">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" disabled={!canSubmit}>
            Create project
          </Button>
        </div>
      </form>
    </div>
  )
}

export function CompanyProjectDetailPage() {
  const { id } = useParams()
  const { updateProjectStatus } = useProjects()
  const tasks = useTasks()
  const { submissions } = useSubmissions()
  const project = id ? getProjectById(id) : undefined

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id]
  )
  const projectTaskIds = useMemo(
    () => new Set(projectTasks.map((t) => t.id)),
    [projectTasks]
  )
  const projectSubs = useMemo(
    () => submissions.filter((s) => projectTaskIds.has(s.taskId)),
    [submissions, projectTaskIds]
  )

  const submittedCount = projectSubs.length
  const approvedCount = projectSubs.filter((s) => s.status === 'approved').length
  const pendingCount = projectSubs.filter((s) => s.status === 'pending').length
  const totalSlots = projectTasks.reduce((acc, t) => acc + t.total, 0)

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
          to="/company/projects"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-brand"
        >
          <ChevronBackIcon />
          Projects
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <HeadlineWithAccent
              as="h1"
              text={project.name}
              accents={[]}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-ink"
            />
            <p className="text-xs text-ink-3 mt-0.5">
              {project.companyName} · created {formatRelative(project.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={project.status} />
            <select
              value={project.status}
              onChange={(e) =>
                updateProjectStatus(project.id, e.target.value as Project['status'])
              }
              className="rounded-md border border-divider bg-surface px-2.5 py-1.5 text-[12px] text-ink focus:outline-none focus:border-brand"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <section
        aria-label="Project stats"
        className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
      >
        <StatCard
          label="Tasks"
          value={projectTasks.length}
          accent
          hint={`${totalSlots} slots`}
        />
        <StatCard label="Submitted" value={submittedCount} hint="All time" />
        <StatCard label="Pending" value={pendingCount} hint="Awaiting review" />
        <StatCard label="Approved" value={approvedCount} accent hint="All time" />
      </section>

      <Card className="flex flex-col gap-2">
        <h3 className="text-[14px] font-semibold text-ink">Description</h3>
        <p className="text-[13.5px] text-ink-2 leading-relaxed whitespace-pre-line">
          {project.description}
        </p>
      </Card>

      <div className="bg-surface border border-divider rounded-xl shadow-card overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b border-divider px-5">
          <h3 className="text-[14px] font-semibold text-ink">
            Tasks · {projectTasks.length}
          </h3>
          <Link to={`/company/projects/${project.id}/tasks/new`}>
            <Button size="sm">
              <PlusIcon />
              Add task
            </Button>
          </Link>
        </div>
        {projectTasks.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-[13px] text-ink-3 max-w-[40ch]">
              No tasks under this project yet. Add a task to define the post, keyword, and pay
              rate workers will see in the marketplace.
            </p>
            <Link to={`/company/projects/${project.id}/tasks/new`}>
              <Button size="sm">Add the first task</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-divider">
            {projectTasks.map((t) => {
              const Glyph = PLATFORM_GLYPH[t.platform]
              const taskSubs = projectSubs.filter((s) => s.taskId === t.id)
              return (
                <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Glyph size={18} className="text-ink-3 shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-ink truncate">
                        {t.targetHandle || t.targetUrl}
                      </span>
                      <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink bg-accent-soft px-2 py-0.5 rounded">
                        {t.keyword}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-ink-3 truncate">
                      {t.brief || 'No brief'}
                    </p>
                    <div className="flex items-center gap-3 text-[11.5px] text-ink-3">
                      <span>
                        {taskSubs.length} of {t.total} claimed
                      </span>
                      <span aria-hidden>·</span>
                      <span className="capitalize">{t.tone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-mono text-[15px] font-bold text-brand tabular-nums">
                      {formatCurrency(t.payRate)}
                    </span>
                    <span className="text-[10.5px] text-ink-3 font-mono uppercase tracking-[0.1em]">
                      per approved
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="bg-surface border border-divider rounded-xl shadow-card overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b border-divider px-5">
          <h3 className="text-[14px] font-semibold text-ink">
            Submissions · {submittedCount}
          </h3>
          <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-3">
            Newest first
          </span>
        </div>
        {projectSubs.length === 0 ? (
          <div className="p-8 flex items-center justify-center text-center">
            <p className="text-[13px] text-ink-3 max-w-[40ch]">
              No submissions yet. As workers claim your tasks, their comments will appear here for
              review.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-divider">
            {[...projectSubs]
              .sort(
                (a, b) =>
                  new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
              )
              .map((s) => (
                <li key={s.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-3 w-16 shrink-0 pt-1">
                    {s.status}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <p className="text-[13px] text-ink leading-relaxed">{s.text}</p>
                    <span className="text-[11.5px] text-ink-3">
                      Submitted {formatRelative(s.submittedAt)}
                      {s.reviewedAt ? ` · reviewed ${formatRelative(s.reviewedAt)}` : ''}
                      {s.rating ? ` · ${s.rating}/5` : ''}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

type TaskFormState = {
  platform: TaskPlatform
  targetHandle: string
  targetUrl: string
  keyword: string
  brief: string
  tone: TaskTone
  payRate: string
  payoutCadence: ProjectTaskInput['payoutCadence']
  payoutMethod: ProjectTaskInput['payoutMethod']
  payoutMin: string
  totalSlots: string
}

const DEFAULT_TASK_FORM: TaskFormState = {
  platform: 'instagram',
  targetHandle: '',
  targetUrl: '',
  keyword: '',
  brief: '',
  tone: 'product',
  payRate: '0.18',
  payoutCadence: 'weekly',
  payoutMethod: 'any',
  payoutMin: '5.00',
  totalSlots: '50',
}

const URL_PATTERN = /^https?:\/\/.+/i
const HANDLE_PATTERN = /^@?[A-Za-z0-9._-]+$/

export function CompanyNewTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addProjectTask } = useProjects()
  const project = id ? getProjectById(id) : undefined

  const [form, setForm] = useState<TaskFormState>(DEFAULT_TASK_FORM)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof TaskFormState, string>> = {}
    if (!URL_PATTERN.test(form.targetUrl.trim())) e.targetUrl = 'Must be a valid URL'
    if (form.targetHandle && !HANDLE_PATTERN.test(form.targetHandle.trim()))
      e.targetHandle = 'Letters, numbers, dots, underscores only'
    if (!form.keyword.trim()) e.keyword = 'Required'
    if (!form.brief.trim() || form.brief.trim().length < 10) e.brief = 'At least 10 characters'
    const pay = parseFloat(form.payRate)
    if (!Number.isFinite(pay) || pay <= 0) e.payRate = 'Must be greater than 0'
    const min = parseFloat(form.payoutMin)
    if (!Number.isFinite(min) || min < 0) e.payoutMin = 'Cannot be negative'
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    if (!canSubmit || !project) return
    setSubmitting(true)
    const handleRaw = form.targetHandle.trim()
    const handle = handleRaw
      ? handleRaw.startsWith('@')
        ? handleRaw
        : `@${handleRaw}`
      : form.targetUrl.trim()
    addProjectTask(project.id, {
      platform: form.platform,
      targetHandle: handle,
      targetUrl: form.targetUrl.trim(),
      keyword: form.keyword.trim(),
      brief: form.brief.trim(),
      tone: form.tone,
      payRate: parseFloat(form.payRate),
      payoutCadence: form.payoutCadence,
      payoutMethod: form.payoutMethod,
      payoutMin: parseFloat(form.payoutMin),
      totalSlots: parseInt(form.totalSlots, 10),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    })
    navigate(`/company/projects/${project.id}`)
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
          New task
        </h1>
        <p className="text-xs text-ink-3 mt-0.5">
          Each task has its own platform, post URL, keyword, and pay rate. You can add as many as
          you need under this project.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <Card className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold text-ink">Where the comments land</h2>
          <Field htmlFor="platform" label="Platform" required>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLATFORM_OPTIONS.map((opt) => {
                const Glyph = PLATFORM_GLYPH[opt.value]
                const isActive = form.platform === opt.value
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => set('platform', opt.value)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-brand text-white border-brand'
                        : 'bg-surface text-ink border-divider hover:border-brand hover:text-brand'
                    )}
                  >
                    <Glyph size={16} className="shrink-0" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              htmlFor="targetUrl"
              label="Post URL"
              required
              error={showError('targetUrl')}
              helper="Link to the post workers will comment under."
            >
              <Input
                id="targetUrl"
                type="url"
                value={form.targetUrl}
                onChange={(e) => set('targetUrl', e.target.value)}
                onBlur={() => blur('targetUrl')}
                hasError={!!showError('targetUrl')}
                placeholder="https://instagram.com/p/..."
              />
            </Field>
            <Field
              htmlFor="targetHandle"
              label="Account handle"
              error={showError('targetHandle')}
              helper="Optional, shown to workers in the task feed."
            >
              <Input
                id="targetHandle"
                value={form.targetHandle}
                onChange={(e) => set('targetHandle', e.target.value)}
                onBlur={() => blur('targetHandle')}
                hasError={!!showError('targetHandle')}
                placeholder="@yourbrand"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              htmlFor="keyword"
              label="Keyword"
              required
              error={showError('keyword')}
              helper="The phrase or word the comment must include naturally."
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
                className="w-full rounded-md border border-divider bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            htmlFor="brief"
            label="Task brief"
            required
            error={showError('brief')}
            helper="What kind of comment do you want for this specific post?"
          >
            <Textarea
              id="brief"
              value={form.brief}
              onChange={(e) => set('brief', e.target.value)}
              onBlur={() => blur('brief')}
              hasError={!!showError('brief')}
              placeholder="React to the new product launch post. Mention 'launch day' naturally. No salesy language."
            />
          </Field>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold text-ink">Pay & payout</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              htmlFor="payRate"
              label="Pay per approved"
              required
              error={showError('payRate')}
              helper="USD."
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
            <Field
              htmlFor="totalSlots"
              label="Total slots"
              required
              error={showError('totalSlots')}
              helper="How many approved comments do you want?"
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
            <Field
              htmlFor="payoutMin"
              label="Payout minimum"
              error={showError('payoutMin')}
              helper="Workers cash out at this threshold."
            >
              <Input
                id="payoutMin"
                type="number"
                step="0.01"
                min="0"
                value={form.payoutMin}
                onChange={(e) => set('payoutMin', e.target.value)}
                onBlur={() => blur('payoutMin')}
                hasError={!!showError('payoutMin')}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field htmlFor="payoutCadence" label="Payout cadence">
              <select
                id="payoutCadence"
                value={form.payoutCadence}
                onChange={(e) =>
                  set('payoutCadence', e.target.value as ProjectTaskInput['payoutCadence'])
                }
                className="w-full rounded-md border border-divider bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {CADENCE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field htmlFor="payoutMethod" label="Payout method">
              <select
                id="payoutMethod"
                value={form.payoutMethod}
                onChange={(e) =>
                  set('payoutMethod', e.target.value as ProjectTaskInput['payoutMethod'])
                }
                className="w-full rounded-md border border-divider bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {METHOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m === 'any' ? 'Any (worker chooses)' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to={`/company/projects/${project.id}`}>
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" disabled={!canSubmit}>
            Add task
          </Button>
        </div>
      </form>
    </div>
  )
}
