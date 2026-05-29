import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/primitives'
import {
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  type Platform,
} from '../../components/ui/PlatformTag'
import {
  useTasks,
  type Project,
  type TaskPlatform,
  type TaskTone,
} from '../../lib/store'
import { cn } from '../../lib/ui-utils'

export const PLATFORM_GLYPH = {
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  x: XIcon,
} satisfies Record<Platform, unknown>

export const PLATFORM_OPTIONS: { value: TaskPlatform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'x', label: 'Twitter' },
]

export const TONE_OPTIONS: { value: TaskTone; label: string }[] = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'product', label: 'Product' },
  { value: 'story', label: 'Story' },
  { value: 'disagreement', label: 'Discourse' },
  { value: 'brand', label: 'Brand' },
]


export function StatusPill({ status }: { status: Project['status'] }) {
  const tone =
    status === 'active'
      ? 'bg-success/15 text-success border-success/30'
      : status === 'paused'
      ? 'bg-warning/15 text-warning border-warning/40'
      : 'bg-muted text-ink-3 border-divider'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-bold uppercase tracking-[0.1em]',
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

export function PlusIcon() {
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

export function ChevronBackIcon() {
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

export function ProjectsCard({
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
        <h3 className="text-sm font-semibold text-ink">
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
          <p className="text-sm text-ink-3 max-w-[40ch]">
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
                    <span className="text-sm font-medium text-ink truncate">
                      {p.name || 'Untitled project'}
                    </span>
                    <span className="text-xs text-ink-3 truncate">
                      {p.companyName} · {p.description.split('\n')[0].slice(0, 80)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono text-sm font-bold text-brand tabular-nums">
                        {projectTasks.length}
                      </span>
                      <span className="text-2xs text-ink-3 font-mono uppercase tracking-[0.1em]">
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
