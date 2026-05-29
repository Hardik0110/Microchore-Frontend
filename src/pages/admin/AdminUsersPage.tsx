import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  apiAdminListUsers,
  apiAdminPromoteReviewer,
  type AdminSocialAccount,
  type AdminUser,
} from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Button, Card, Field, Input } from '../../components/ui/primitives'

const PLATFORM_LABEL: Record<AdminSocialAccount['platform'], string> = {
  IG: 'Instagram',
  YT: 'YouTube',
  TIKTOK: 'TikTok',
  X: 'Twitter',
}

const PAGE_SIZE = 50
const TIER_OPTIONS = ['T1', 'T2', 'ADMIN'] as const
type Tier = (typeof TIER_OPTIONS)[number]

function formatRating(value: number | null): string {
  if (value == null) return '—'
  return value.toFixed(2)
}

export function AdminUsersPage() {
  const { user, isHydrating } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [promotingId, setPromotingId] = useState<number | null>(null)
  const [promoteError, setPromoteError] = useState<string | null>(null)

  const isPlatformAdmin = user?.role === 'PLATFORM_ADMIN'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiAdminListUsers({ limit: PAGE_SIZE, offset, q: query })
      setUsers(res.results)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.')
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [offset, query])

  useEffect(() => {
    if (isHydrating) return
    if (!isPlatformAdmin) return
    load()
  }, [isHydrating, isPlatformAdmin, load])

  async function handlePromote(target: AdminUser, tier: Tier) {
    setPromotingId(target.id)
    setPromoteError(null)
    try {
      const updated = await apiAdminPromoteReviewer(target.id, { tier })
      setUsers((rows) => rows.map((u) => (u.id === updated.id ? updated : u)))
    } catch (err) {
      setPromoteError(err instanceof Error ? err.message : `Could not promote ${target.email}.`)
    } finally {
      setPromotingId(null)
    }
  }

  const pageRange = useMemo(() => {
    const start = total === 0 ? 0 : offset + 1
    const end = Math.min(offset + PAGE_SIZE, total)
    return { start, end }
  }, [offset, total])

  if (isHydrating) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isPlatformAdmin) return <Navigate to="/" replace />

  return (
    <main className="min-h-screen bg-bg text-ink px-6 py-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3">Platform admin</p>
          <h1 className="font-serif text-3xl text-ink tracking-tighter">Users</h1>
          <p className="text-sm text-ink-2">
            Everyone on the platform — connected socials, review ratings, and a path to promote writers into reviewers.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <form
            className="flex items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setOffset(0)
              setQuery(searchInput.trim())
            }}
          >
            <Field htmlFor="admin-user-search" label="Search">
              <Input
                id="admin-user-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Email or handle"
              />
            </Field>
            <Button type="submit" size="md">Search</Button>
            {query ? (
              <Button
                type="button"
                size="md"
                variant="ghost"
                onClick={() => {
                  setSearchInput('')
                  setQuery('')
                  setOffset(0)
                }}
              >
                Clear
              </Button>
            ) : null}
          </form>

          {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
          {promoteError ? <p className="text-sm text-danger" role="alert">{promoteError}</p> : null}

          {loading ? (
            <p className="text-sm text-ink-3">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-ink-3">No users match.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left font-mono text-2xs tracking-stamp uppercase text-ink-3 border-b border-divider">
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Socials</th>
                    <th className="py-2 pr-3">Avg rating</th>
                    <th className="py-2 pr-3">Approved</th>
                    <th className="py-2 pr-3">Reviewer</th>
                    <th className="py-2 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-divider align-top">
                      <td className="py-3 pr-3">
                        <div className="flex flex-col">
                          <span className="text-ink">{u.email}</span>
                          {u.handle ? <span className="text-ink-3 text-xs">@{u.handle}</span> : null}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-ink-2">{u.role}</td>
                      <td className="py-3 pr-3">
                        {u.socialAccounts.length === 0 ? (
                          <span className="text-ink-3">—</span>
                        ) : (
                          <ul className="flex flex-col gap-0.5">
                            {u.socialAccounts.map((sa) => (
                              <li key={`${sa.platform}-${sa.handle}`} className="text-ink-2">
                                <span className="font-mono text-2xs tracking-stamp uppercase text-ink-3 mr-1">
                                  {PLATFORM_LABEL[sa.platform] ?? sa.platform}
                                </span>
                                @{sa.handle}
                                {sa.followerCount ? (
                                  <span className="text-ink-3 text-xs ml-1">({sa.followerCount.toLocaleString()} followers)</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-ink-2 font-mono">{formatRating(u.averageRating)}</td>
                      <td className="py-3 pr-3 text-ink-2">{u.approvedSubmissionCount}</td>
                      <td className="py-3 pr-3 text-ink-2">
                        {u.reviewerTier ? (
                          <span>
                            {u.reviewerTier}
                            {u.reviewerMultiplier != null ? (
                              <span className="text-ink-3 text-xs ml-1">×{u.reviewerMultiplier.toFixed(2)}</span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-ink-3">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <PromoteActions
                          user={u}
                          busy={promotingId === u.id}
                          onPromote={(tier) => handlePromote(u, tier)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-ink-3">
            <span>
              Showing {pageRange.start}–{pageRange.end} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={offset + PAGE_SIZE >= total || loading}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}

function PromoteActions({
  user,
  busy,
  onPromote,
}: {
  user: AdminUser
  busy: boolean
  onPromote: (tier: Tier) => void
}) {
  const [selectedTier, setSelectedTier] = useState<Tier>(user.reviewerTier ?? 'T1')
  const label = user.reviewerTier ? 'Update tier' : 'Make reviewer'

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedTier}
        onChange={(e) => setSelectedTier(e.target.value as Tier)}
        disabled={busy}
        className="rounded-md border border-divider bg-surface px-2 py-1 text-xs"
      >
        {TIER_OPTIONS.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </select>
      <Button type="button" size="md" disabled={busy} onClick={() => onPromote(selectedTier)}>
        {busy ? 'Updating…' : label}
      </Button>
    </div>
  )
}
