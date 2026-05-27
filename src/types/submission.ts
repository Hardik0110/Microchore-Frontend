import type { TaskTone } from './task'

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
