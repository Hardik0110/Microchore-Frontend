import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatCard } from '../../components/ui/primitives'
import { useProjects, useTasks } from '../../lib/store'
import { PlusIcon, ProjectsCard } from './shared'

export function CompanyDashboardPage() {
  const { projects } = useProjects()
  const tasks = useTasks()

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length
    const projectTasks = tasks.filter((t) => t.kind === 'real' && t.projectId)
    const totalSlots = projectTasks.reduce((acc, t) => acc + t.total, 0)
    return {
      activeProjects: active,
      totalProjects: projects.length,
      tasks: projectTasks.length,
      totalSlots,
    }
  }, [projects, tasks])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Company dashboard
          </h1>
          <p className="text-xs text-ink-3 mt-0.5">
            {stats.totalProjects} {stats.totalProjects === 1 ? 'project' : 'projects'} ·{' '}
            {stats.tasks} {stats.tasks === 1 ? 'task' : 'tasks'} · {stats.totalSlots} slots
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
          label="Total projects"
          value={stats.totalProjects}
          hint="All statuses"
        />
      </section>

      <ProjectsCard projects={projects.slice(0, 5)} tasks={tasks} showAllLink />
    </div>
  )
}
