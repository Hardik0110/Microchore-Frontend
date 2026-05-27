import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiClaimTask,
  apiCreateProject,
  apiCreateProjectTask,
  apiCreateSubmission,
  apiGetMySubmissions,
  apiGetNotifications,
  apiGetProjects,
  apiGetTasks,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  apiReviewSubmission,
  apiUpdateProjectStatus,
} from './api'
import type {
  TaskKind,
  TaskTone,
  TaskPlatform,
  Task,
  Submission,
  SubmissionCreatePayload,
  EarningsSummary,
  Project,
  ProjectTaskInput,
  Notification,
} from '../types'

export type {
  TaskKind,
  TaskTone,
  TaskPlatform,
  Task,
  Submission,
  SubmissionCreatePayload,
  EarningsSummary,
  Project,
  ProjectTaskInput,
  Notification,
}

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
const taskListeners = new Set<() => void>()

function notifyTasks() {
  for (const l of taskListeners) l()
}

export function getAllTasks(): Task[] {
  return taskCache
}

export function getTaskById(id: string | number): Task | undefined {
  const target = String(id)
  return taskCache.find((t) => String(t.id) === target)
}

function fetchTasksOnce(): Promise<Task[]> {
  if (taskInflight) return taskInflight
  taskInflight = apiGetTasks().finally(() => {
    taskInflight = null
  })
  return taskInflight
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => taskCache)

  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (!cancelled) setTasks([...taskCache])
    }
    taskListeners.add(sync)
    fetchTasksOnce()
      .then((fresh) => {
        if (cancelled) return
        taskCache = fresh
        notifyTasks()
      })
      .catch(() => {
        if (cancelled) return
      })
    return () => {
      cancelled = true
      taskListeners.delete(sync)
    }
  }, [])

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
  taskCache = []
  submissionCache = []
  projectCache = []
  notificationCache = []
  notificationUnread = 0
  notifyTasks()
  notifySubmissions()
  notifyProjects()
  notifyNotifications()
}

let projectCache: Project[] = []
let projectInflight: Promise<Project[]> | null = null
const projectListeners = new Set<() => void>()

function notifyProjects() {
  for (const l of projectListeners) l()
}

function fetchProjectsOnce(): Promise<Project[]> {
  if (projectInflight) return projectInflight
  projectInflight = apiGetProjects().finally(() => {
    projectInflight = null
  })
  return projectInflight
}

export function getProjectById(id: string): Project | undefined {
  return projectCache.find((p) => p.id === id)
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => projectCache)

  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (!cancelled) setProjects([...projectCache])
    }
    projectListeners.add(sync)
    fetchProjectsOnce()
      .then((fresh) => {
        if (cancelled) return
        projectCache = fresh
        notifyProjects()
      })
      .catch(() => {
        if (cancelled) return
      })
    return () => {
      cancelled = true
      projectListeners.delete(sync)
    }
  }, [])

  const addProject = useCallback(
    async (input: Pick<Project, 'companyName' | 'name' | 'description' | 'targetUrl' | 'payRate'>): Promise<Project> => {
      const created = await apiCreateProject(input)
      projectCache = [created, ...projectCache.filter((p) => p.id !== created.id)]
      notifyProjects()
      return created
    },
    []
  )

  const addProjectTask = useCallback(
    async (projectId: string, input: ProjectTaskInput): Promise<Task> => {
      const created = await apiCreateProjectTask(projectId, input)
      taskCache = [created, ...taskCache.filter((t) => String(t.id) !== String(created.id))]
      notifyTasks()
      return created
    },
    []
  )

  const updateProjectStatus = useCallback(
    async (id: string, status: Project['status']): Promise<Project | undefined> => {
      const updated = await apiUpdateProjectStatus(id, status)
      projectCache = projectCache.map((p) => (p.id === updated.id ? updated : p))
      notifyProjects()
      return updated
    },
    []
  )

  return { projects, addProject, addProjectTask, updateProjectStatus }
}

let notificationCache: Notification[] = []
let notificationUnread = 0
let notificationInflight: Promise<{ results: Notification[]; unreadCount: number }> | null = null
const notificationListeners = new Set<() => void>()

function notifyNotifications() {
  for (const l of notificationListeners) l()
}

function fetchNotificationsOnce(): Promise<{ results: Notification[]; unreadCount: number }> {
  if (notificationInflight) return notificationInflight
  notificationInflight = apiGetNotifications().finally(() => {
    notificationInflight = null
  })
  return notificationInflight
}

const NOTIFICATION_POLL_MS = 60_000

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationCache)
  const [unreadCount, setUnreadCount] = useState<number>(() => notificationUnread)

  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (cancelled) return
      setNotifications([...notificationCache])
      setUnreadCount(notificationUnread)
    }
    notificationListeners.add(sync)

    const load = () => {
      fetchNotificationsOnce()
        .then((fresh) => {
          if (cancelled) return
          notificationCache = fresh.results
          notificationUnread = fresh.unreadCount
          notifyNotifications()
        })
        .catch(() => {
          if (cancelled) return
        })
    }

    load()
    const timer = window.setInterval(load, NOTIFICATION_POLL_MS)

    return () => {
      cancelled = true
      notificationListeners.delete(sync)
      window.clearInterval(timer)
    }
  }, [])

  const markRead = useCallback(async (id: number): Promise<void> => {
    const before = notificationCache.find((n) => n.id === id)
    if (!before || before.isRead) return
    const updated = await apiMarkNotificationRead(id)
    notificationCache = notificationCache.map((n) => (n.id === id ? updated : n))
    notificationUnread = Math.max(0, notificationUnread - 1)
    notifyNotifications()
  }, [])

  const markAllRead = useCallback(async (): Promise<void> => {
    if (notificationUnread === 0) return
    await apiMarkAllNotificationsRead()
    const now = new Date().toISOString()
    notificationCache = notificationCache.map((n) =>
      n.isRead ? n : { ...n, isRead: true, readAt: now },
    )
    notificationUnread = 0
    notifyNotifications()
  }, [])

  return { notifications, unreadCount, markRead, markAllRead }
}
