import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  function toggle(id: string) {
    setExpandedId((curr) => (curr === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-6">
        <HeadlineWithAccent
          as="h1"
          text={realTasksUnlocked ? 'Pick a brief.' : 'Marketplace locked.'}
          accents={['brief']}
          className="font-serif text-[48px] md:text-[60px] leading-[1.02] tracking-tighter font-normal text-ink"
        />
        <p className="text-[16px] md:text-[17px] text-ink-2 leading-relaxed max-w-[60ch]">
          Open briefs across every platform you have linked. Pay rate, cadence, and payout method
          are set per project and shown on each task. Click any brief to see the full ask.
        </p>
      </header>

      {!realTasksUnlocked ? (
        <Card>
          <Eyebrow dot dotColor="info">Practice tasks pending</Eyebrow>
          <p className="mt-2 text-[14px] text-ink-2 leading-relaxed">
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
              <p className="mt-2 text-[14px] text-ink-2 leading-relaxed">
                Try a different platform or clear the search.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => {
                const id = String(t.id)
                return (
                  <TaskCard
                    key={id}
                    task={t}
                    isExpanded={expandedId === id}
                    onToggle={() => toggle(id)}
                  />
                )
              })}
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
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors',
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
          <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
            {count} {count === 1 ? 'brief' : 'briefs'}
          </span>
          <label className="flex items-center gap-2 text-[12px] text-ink-2">
            <span className="font-mono text-[10px] tracking-stamp uppercase">Sort</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="rounded-md border border-divider bg-surface px-2.5 py-1.5 text-[13px] text-ink focus:outline-none focus:border-brand"
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

function TaskCard({
  task,
  isExpanded,
  onToggle,
}: {
  task: Task
  isExpanded: boolean
  onToggle: () => void
}) {
  const expiresAt = useMemo(() => {
    const d = new Date(task.expiresAt)
    const ms = d.getTime() - Date.now()
    const days = Math.floor(ms / 86_400_000)
    const hours = Math.floor((ms % 86_400_000) / 3_600_000)
    if (ms <= 0) return 'Expired'
    if (days >= 1) return `${days}d ${hours}h left`
    return `${hours}h left`
  }, [task.expiresAt])

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
      className={cn(
        'rounded-xl border border-divider bg-surface shadow-card overflow-hidden transition-colors',
        isExpanded && 'md:col-span-2 ring-1 ring-brand/30 border-brand/40',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full text-left p-5 flex flex-col gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 hover:bg-bg/40 transition-colors"
      >
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
            className="text-[18px] font-medium tracking-tight text-ink"
          />
          <p
            className={cn(
              'text-[13px] text-ink-2 leading-relaxed',
              isExpanded ? '' : 'line-clamp-2',
            )}
          >
            {task.brief}
          </p>
        </div>

        <div className="flex items-center justify-between text-[12px] text-ink-3">
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
            <span className="signature text-[24px] leading-none">{formatCurrency(task.payRate)}</span>
            <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
              On approval
            </span>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[12px] font-medium text-brand transition-transform',
              isExpanded ? 'rotate-180' : '',
            )}
            aria-hidden
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-divider px-5 py-5 flex flex-col gap-5 bg-bg/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ExpandedStat label="Pay per approval" value={formatCurrency(task.payRate)} />
                <ExpandedStat label="Slots left" value={`${task.remaining} of ${task.total}`} />
                <ExpandedStat label="Window" value={expiresAt} />
              </div>

              <div>
                <p className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                  Target post
                </p>
                <a
                  href={task.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] text-brand hover:text-brand-deep transition-colors break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.targetUrl}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6" />
                    <path d="m10 14 11-11" />
                  </svg>
                </a>
              </div>

              <div>
                <p className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                  What to write
                </p>
                <p className="mt-1.5 text-[13.5px] text-ink leading-relaxed">{task.brief}</p>
              </div>

              {task.tone ? (
                <div className="flex items-center gap-2 text-[12px] text-ink-2">
                  <span className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">
                    Tone
                  </span>
                  <RowTag label={task.tone} tone="accent" />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[12px] text-ink-3 max-w-[40ch]">
                  Clicking through claims a slot and opens the editor. You can leave the editor and
                  return; the slot stays yours.
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onToggle}>
                    Close
                  </Button>
                  <Link to={`/app/tasks/${task.id}`}>
                    <Button size="sm">Start writing</Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function ExpandedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-divider bg-surface p-3">
      <p className="font-mono text-[10px] tracking-stamp uppercase text-ink-3">{label}</p>
      <p className="mt-1.5 text-[15px] font-semibold text-ink tabular-nums">{value}</p>
    </div>
  )
}
