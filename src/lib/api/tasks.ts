import type { Task, Claim } from '../../types'
import { apiFetch, ApiError } from './client'

function normalizeTaskId<T extends { id: string | number }>(t: T): T & { id: string } {
  return { ...t, id: String(t.id) }
}

export async function apiGetTasks(): Promise<Task[]> {
  const data = await apiFetch<Task[] | { results: Task[] }>('/api/tasks/')
  const list = Array.isArray(data) ? data : data.results ?? []
  return list.map(normalizeTaskId) as Task[]
}

export async function apiGetTask(id: string | number): Promise<Task | null> {
  try {
    const t = await apiFetch<Task>(`/api/tasks/${id}/`)
    return normalizeTaskId(t) as Task
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function apiClaimTask(taskId: string | number): Promise<Claim> {
  return apiFetch<Claim>(`/api/tasks/${taskId}/claim/`, { method: 'POST' })
}
