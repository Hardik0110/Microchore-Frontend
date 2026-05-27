export type ReviewerQueueItem = {
  id: string
  taskId: string
  taskTitle: string
  taskTone: string
  targetUrl: string
  keyword: string
  text: string
  commentUrl: string
  commentAccountHandle: string
  elapsedSec: number
  pasteCount: number
  pastedChars: number
  charsTyped: number
  submittedAt: string
  reviewCount: number
}

export type ReviewCreatePayload = {
  rating: 1 | 2 | 3 | 4 | 5
  justification_text: string
  feels_ai_flag: boolean
  time_taken_seconds: number
}
