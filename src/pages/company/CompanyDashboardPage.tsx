import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatCard } from '../../components/ui/primitives'
import { useProjects, useSubmissions, useTasks } from '../../lib/store'
import { PlusIcon, ProjectsCard } from './shared'

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
