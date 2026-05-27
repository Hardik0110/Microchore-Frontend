export type TaskKind = 'starter' | 'real'

export type TaskTone = 'lifestyle' | 'product' | 'story' | 'disagreement' | 'brand'

export type TaskPlatform = 'instagram' | 'youtube' | 'tiktok' | 'x'

export type Task = {
  id: string
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

export type Claim = {
  id: number
  taskId: number
  userId: number
  claimedAt: string
  expiresAt: string
  status: string
}
