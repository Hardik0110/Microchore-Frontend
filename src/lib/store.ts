import { useCallback, useEffect, useMemo, useState } from 'react'
import { shortId } from './ui-utils'
import {
  apiClaimTask,
  apiCreateSubmission,
  apiGetMySubmissions,
  apiGetTasks,
  apiReviewSubmission,
} from './api'

export type TaskKind = 'starter' | 'real'
export type TaskTone = 'lifestyle' | 'product' | 'story' | 'disagreement' | 'brand'
export type TaskPlatform = 'instagram' | 'youtube' | 'tiktok' | 'x'

export type Task = {
  id: string | number
  kind: TaskKind
  projectId?: string
  platform: TaskPlatform
  targetHandle: string
  targetUrl: string
  brief: string
  keyword: string
  payRate: number
  payoutCadence: 'weekly' | 'biweekly' | 'monthly'
  payoutMin: number
  payoutMethod: 'airtm' | 'paypal' | 'crypto' | 'any'
  remaining: number
  total: number
  tone: TaskTone
  expiresAt: string
  hot?: boolean
  starterIndex?: number
}

export type Submission = {
  id: string
  taskId: string
  taskTitle: string
  taskTone: TaskTone
  text: string
  commentUrl: string
  pasteCount: number
  charsTyped: number
  pastedChars: number
  elapsedSec: number
  attestationSigned: boolean
  status: 'pending' | 'approved' | 'rejected'
  rating?: 1 | 2 | 3 | 4 | 5
  justification?: string
  basePayout: number
  bonusPayout: number
  submittedAt: string
  reviewedAt?: string
  isStarter: boolean
}

export type SubmissionCreatePayload = {
  taskId: string | number
  text: string
  commentUrl: string
  pasteCount: number
  charsTyped: number
  pastedChars: number
  elapsedSec: number
  attestationSigned: boolean
}

export type EarningsSummary = {
  approvedCount: number
  pendingCount: number
  rejectedCount: number
  totalEarned: number
  averageRating: number
  approved: Submission[]
  latest: Submission | undefined
  all: Submission[]
}

const TASKS_KEY = 'microchore:tasks'

const STARTER_TASKS: Task[] = []
const REAL_TASKS: Task[] = []

let submissionCache: Submission[] = []
let submissionInflight: Promise<Submission[]> | null = null
const submissionListeners = new Set<() => void>()

function notifySubmissions() {
  for (const l of submissionListeners) l()
}

function fetchSubmissionsOnce(): Promise<Submission[]> {
  if (submissionInflight) return submissionInflight
  submissionInflight = apiGetMySubmissions().finally(() => {
    submissionInflight = null
  })
  return submissionInflight
}

let taskCache: Task[] = []
let taskInflight: Promise<Task[]> | null = null

const SEED_TASKS: Task[] = [...STARTER_TASKS, ...REAL_TASKS]

export function getAllTasks(): Task[] {
  return taskCache.length > 0 ? taskCache : SEED_TASKS
}

export function getTaskById(id: string | number): Task | undefined {
  const target = String(id)
  return getAllTasks().find((t) => String(t.id) === target)
}

function fetchTasksOnce(): Promise<Task[]> {
  if (taskInflight) return taskInflight
  taskInflight = apiGetTasks().finally(() => {
    taskInflight = null
  })
  return taskInflight
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getAllTasks())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchTasksOnce()
      .then((fresh) => {
        if (cancelled) return
        taskCache = fresh
        setTasks(fresh)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load tasks')
        if (taskCache.length === 0) setTasks(SEED_TASKS)
      })

    const refresh = () => setTasks(getAllTasks())
    window.addEventListener('microchore:tasks-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('microchore:tasks-changed', refresh)
    }
  }, [])

  void error
  return tasks
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => submissionCache)

  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (!cancelled) setSubmissions([...submissionCache])
    }
    submissionListeners.add(sync)
    fetchSubmissionsOnce()
      .then((fresh) => {
        if (cancelled) return
        submissionCache = fresh
        notifySubmissions()
      })
      .catch(() => {
        if (cancelled) return
        if (submissionCache.length === 0) setSubmissions([])
      })
    return () => {
      cancelled = true
      submissionListeners.delete(sync)
    }
  }, [])

  const addSubmission = useCallback(
    async (payload: SubmissionCreatePayload, isStarter = false): Promise<Submission> => {
      if (!isStarter) {
        await apiClaimTask(payload.taskId)
      }
      const created = await apiCreateSubmission(payload)
      submissionCache = [created, ...submissionCache.filter((s) => s.id !== created.id)]
      notifySubmissions()
      return created
    },
    []
  )

  const reviewSubmission = useCallback(
    async (
      id: string,
      decision: 'approved' | 'rejected',
      rating: 1 | 2 | 3 | 4 | 5,
      justification: string,
    ): Promise<Submission | undefined> => {
      const updated = await apiReviewSubmission(id, decision, rating, justification)
      submissionCache = submissionCache.map((s) => (s.id === updated.id ? updated : s))
      notifySubmissions()
      return updated
    },
    []
  )

  return { submissions, addSubmission, reviewSubmission }
}

export function useEarnings(): EarningsSummary {
  const { submissions } = useSubmissions()
  return useMemo<EarningsSummary>(() => {
    const real = submissions.filter((s) => !s.isStarter)
    const approved = real.filter((s) => s.status === 'approved')
    const totalEarned = approved.reduce((acc, s) => acc + s.basePayout + s.bonusPayout, 0)
    const pending = real.filter((s) => s.status === 'pending').length
    const rejected = real.filter((s) => s.status === 'rejected').length
    const averageRating =
      approved.length > 0
        ? approved.reduce((acc, s) => acc + (s.rating ?? 0), 0) / approved.length
        : 0
    return {
      approvedCount: approved.length,
      pendingCount: pending,
      rejectedCount: rejected,
      totalEarned,
      averageRating,
      approved,
      latest: approved[0],
      all: real,
    }
  }, [submissions])
}

export function resetMockData() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TASKS_KEY)
  window.localStorage.removeItem(PROJECTS_KEY)
  submissionCache = []
  notifySubmissions()
}

export type Project = {
  id: string
  companyName: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused'
  createdAt: string
}

export type ProjectTaskInput = {
  platform: TaskPlatform
  targetHandle: string
  targetUrl: string
  keyword: string
  brief: string
  tone: TaskTone
  payRate: number
  payoutCadence: 'weekly' | 'biweekly' | 'monthly'
  payoutMethod: 'airtm' | 'paypal' | 'crypto' | 'any'
  payoutMin: number
  totalSlots: number
  expiresAt: string
}

const PROJECTS_KEY = 'microchore:projects'

function readProjects(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

function writeProjects(list: Project[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(list))
}

export function getProjectById(id: string): Project | undefined {
  return readProjects().find((p) => p.id === id)
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => readProjects())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROJECTS_KEY) setProjects(readProjects())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addProject = useCallback(
    (input: Pick<Project, 'companyName' | 'name' | 'description'>) => {
      const project: Project = {
        id: shortId(),
        companyName: input.companyName,
        name: input.name,
        description: input.description,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      const nextProjects = [project, ...readProjects()]
      writeProjects(nextProjects)
      setProjects(nextProjects)
      return project
    },
    []
  )

  const addProjectTask = useCallback(
    (projectId: string, input: ProjectTaskInput) => {
      const task: Task = {
        id: shortId(),
        kind: 'real',
        projectId,
        platform: input.platform,
        targetHandle: input.targetHandle,
        targetUrl: input.targetUrl,
        brief: input.brief,
        keyword: input.keyword,
        payRate: input.payRate,
        payoutCadence: input.payoutCadence,
        payoutMethod: input.payoutMethod,
        payoutMin: input.payoutMin,
        remaining: input.totalSlots,
        total: input.totalSlots,
        tone: input.tone,
        expiresAt: input.expiresAt,
      }
      try {
        const nextTasks = [task, ...getAllTasks()]
        window.localStorage.setItem(TASKS_KEY, JSON.stringify(nextTasks))
        window.dispatchEvent(new Event('microchore:tasks-changed'))
      } catch {}
      return task
    },
    []
  )

  const updateProjectStatus = useCallback(
    (id: string, status: Project['status']) => {
      const all = readProjects()
      const idx = all.findIndex((p) => p.id === id)
      if (idx < 0) return undefined
      const next = [...all]
      next[idx] = { ...all[idx], status }
      writeProjects(next)
      setProjects(next)
      return next[idx]
    },
    []
  )

  return { projects, addProject, addProjectTask, updateProjectStatus }
}
