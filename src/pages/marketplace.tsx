import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Eyebrow,
  HeadlineWithAccent,
  Input,
  RowTag,
} from '../components/ui/primitives'
import { PlatformTag } from '../components/ui/PlatformTag'
import { useAuth } from '../lib/auth'
import { useTasks, type Task } from '../lib/store'
import { cn, formatCurrency } from '../lib/ui-utils'

type SortKey = 'hot' | 'highest' | 'newest'
type PlatformFilter = 'all' | Task['platform']

const SORT_LABELS: Record<SortKey, string> = {
  hot: 'Hot first',
  highest: 'Highest pay',
  newest: 'Newest',
}

export function MarketplacePage() {
  const tasks = useTasks()
  const { user } = useAuth()
  const realTasksUnlocked = user?.realTasksUnlocked ?? false

  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sort, setSort] = useState<SortKey>('hot')
  const [query, setQuery] = useState('')

  const realTasks = useMemo(() => tasks.filter((t) => t.kind === 'real'), [tasks])

  const filtered = useMemo(() => {
    let list = realTasks
    if (platformFilter !== 'all') list = list.filter((t) => t.platform === platformFilter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.targetHandle.toLowerCase().includes(q) ||
          t.keyword.toLowerCase().includes(q) ||
          t.brief.toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    if (sort === 'hot') {
      sorted.sort((a, b) => Number(!!b.hot) - Number(!!a.hot) || b.payRate - a.payRate)
    } else if (sort === 'highest') {
      sorted.sort((a, b) => b.payRate - a.payRate)
    } else {
      sorted.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
    }
    return sorted
  }, [realTasks, platformFilter, sort, query])

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-6">
        <HeadlineWithAccent
          as="h1"
          text={realTasksUnlocked ? 'Pick a brief.' : 'Marketplace locked.'}
          accents={['brief']}
          className="font-serif text-5xl md:text-6xl leading-[1.02] tracking-tighter font-normal text-ink"
        />
        <p className="text-base md:text-base text-ink-2 leading-relaxed max-w-[60ch]">
          Open briefs across every platform you have linked. Pay rate, cadence, and payout method
          are set per project and shown on each task.
        </p>
      </header>

      {!realTasksUnlocked ? (
        <Card>
          <Eyebrow dot dotColor="info">Practice tasks pending</Eyebrow>
          <p className="mt-2 text-sm text-ink-2 leading-relaxed">
            The marketplace opens as soon as your practice tasks are reviewed. Head back to the
            dashboard to see how many are left.
          </p>
          <Link to="/app">
            <Button className="mt-4" variant="ghost">
              Open dashboard
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <FilterBar
            platformFilter={platformFilter}
            onPlatformChange={setPlatformFilter}
            sort={sort}
            onSortChange={setSort}
            query={query}
            onQueryChange={setQuery}
            count={filtered.length}
          />

          {filtered.length === 0 ? (
            <Card>
              <Eyebrow>No briefs match</Eyebrow>
              <p className="mt-2 text-sm text-ink-2 leading-relaxed">
                Try a different platform or clear the search.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterBar({
  platformFilter,
  onPlatformChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  count,
}: {
  platformFilter: PlatformFilter
  onPlatformChange: (p: PlatformFilter) => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
  query: string
  onQueryChange: (q: string) => void
  count: number
}) {
  const platforms: { value: PlatformFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'x', label: 'Twitter' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPlatformChange(p.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              platformFilter === p.value
                ? 'bg-brand text-white border-brand'
                : 'bg-surface text-ink border-divider hover:border-brand'
            )}
          >
            {p.value !== 'all' ? (
              <PlatformTag platform={p.value} size={12} className="text-current" label="" />
            ) : null}
            {p.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
            {count} {count === 1 ? 'brief' : 'briefs'}
          </span>
          <label className="flex items-center gap-2 text-xs text-ink-2">
            <span className="font-mono text-2xs tracking-stamp uppercase">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="rounded-md border border-divider bg-surface px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Input
        placeholder="Search by handle, keyword, or brief..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  )
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PlatformTag platform={task.platform} />
        <div className="flex items-center gap-2">
          {task.hot ? <RowTag label="Hot" tone="danger" /> : null}
          {task.remaining <= 3 ? (
            <span className="animate-pulse">
              <RowTag label={`Only ${task.remaining} left`} tone="danger" />
            </span>
          ) : (
            <RowTag label={`${task.remaining} left`} tone="accent" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <HeadlineWithAccent
          as="h3"
          text={`Comment on ${task.targetHandle}`}
          accents={[task.targetHandle]}
          className="text-lg font-medium tracking-tight text-ink"
        />
        <p className="text-sm text-ink-2 leading-relaxed line-clamp-2">{task.brief}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-3">
        <span>
          Keyword:{' '}
          <span className="font-mono text-ink bg-accent-soft px-2 py-0.5 rounded">
            {task.keyword}
          </span>
        </span>
        <span className="font-mono tracking-stamp uppercase">{task.payoutCadence}</span>
      </div>

      <div className="flex items-center justify-between border-t border-divider pt-4 mt-1">
        <div className="flex flex-col">
          <span className="signature text-2xl leading-none">{formatCurrency(task.payRate)}</span>
          <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3">
            On approval
          </span>
        </div>
        <Link to={`/app/tasks/${task.id}`}>
          <Button>Open brief</Button>
        </Link>
      </div>
    </Card>
  )
}
