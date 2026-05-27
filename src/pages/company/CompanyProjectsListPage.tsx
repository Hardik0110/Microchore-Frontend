import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives'
import { useProjects, useTasks } from '../../lib/store'
import { PlusIcon, ProjectsCard } from './shared'

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
