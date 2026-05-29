import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, HeadlineWithAccent, StatCard } from '../../components/ui/primitives'
import {
  getProjectById,
  useProjects,
  useTasks,
  type Project,
} from '../../lib/store'
import { formatCurrency, formatRelative } from '../../lib/ui-utils'
import { ChevronBackIcon, PLATFORM_GLYPH, PlusIcon, StatusPill } from './shared'

export function CompanyProjectDetailPage() {
  const { id } = useParams()
  const { updateProjectStatus } = useProjects()
  const tasks = useTasks()
  const project = id ? getProjectById(id) : undefined
  const [statusError, setStatusError] = useState<string | null>(null)

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === id),
    [tasks, id]
  )
  const totalSlots = projectTasks.reduce((acc, t) => acc + t.total, 0)

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-2">Project not found.</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-brand"
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
              onChange={async (e) => {
                const next = e.target.value as Project['status']
                setStatusError(null)
                try {
                  await updateProjectStatus(project.id, next)
                } catch (err) {
                  setStatusError(err instanceof Error ? err.message : 'Could not update status.')
                }
              }}
              className="rounded-md border border-divider bg-surface px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-brand"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {statusError ? (
        <p className="text-sm text-danger" role="alert">{statusError}</p>
      ) : null}

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
        <StatCard label="Slots" value={totalSlots} hint="Across all tasks" />
      </section>

      <Card className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-ink">Description</h3>
        <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">
          {project.description}
        </p>
      </Card>

      <div className="bg-surface border border-divider rounded-xl shadow-card overflow-hidden">
        <div className="flex h-12 items-center justify-between border-b border-divider px-5">
          <h3 className="text-sm font-semibold text-ink">
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
            <p className="text-sm text-ink-3 max-w-[40ch]">
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
              return (
                <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Glyph size={18} className="text-ink-3 shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0 flex-1 gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink truncate">
                        {t.targetHandle || t.targetUrl}
                      </span>
                      <span className="font-mono text-2xs tracking-[0.1em] uppercase text-ink bg-accent-soft px-2 py-0.5 rounded">
                        {t.keyword}
                      </span>
                    </div>
                    <p className="text-xs text-ink-3 truncate">
                      {t.brief || 'No brief'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-ink-3">
                      <span>
                        {t.total} slots
                      </span>
                      <span aria-hidden>·</span>
                      <span className="capitalize">{t.tone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-mono text-base font-bold text-brand tabular-nums">
                      {formatCurrency(t.payRate)}
                    </span>
                    <span className="text-2xs text-ink-3 font-mono uppercase tracking-[0.1em]">
                      per approved
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Card className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-ink">Submissions</h3>
        <p className="text-sm text-ink-2 leading-relaxed">
          Per-project submission review will appear here once the project-scoped submissions endpoint
          is available. Worker submissions across all your tasks are not shown on this page yet.
        </p>
      </Card>
    </div>
  )
}
