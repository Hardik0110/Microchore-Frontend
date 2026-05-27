import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, HeadlineWithAccent, StatCard } from '../../components/ui/primitives'
import {
  getProjectById,
  useProjects,
  useSubmissions,
  useTasks,
  type Project,
} from '../../lib/store'
import { formatCurrency, formatRelative } from '../../lib/ui-utils'
import { ChevronBackIcon, PLATFORM_GLYPH, PlusIcon, StatusPill } from './shared'

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
              onChange={(e) => {
                void updateProjectStatus(project.id, e.target.value as Project['status'])
              }}
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
