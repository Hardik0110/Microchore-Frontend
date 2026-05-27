import type { TaskTone } from './task'

export type Project = {
  id: string
  companyName: string
  name: string
  description: string
  targetUrl: string
  payRate: number
  status: 'draft' | 'active' | 'paused'
  createdAt: string
}

export type ProjectTaskInput = {
  keyword: string
  tone: TaskTone
  totalSlots: number
}
