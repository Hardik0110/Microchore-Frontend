import type { Submission, ReviewerQueueItem, ReviewCreatePayload } from '../../types'
import { apiFetch } from './client'

export type ReviewerEarning = {
  id: number
  amount: number
  status: string
  projectName: string | null
  createdAt: string | null
  paidAt: string | null
}

export type ReviewerStats = {
  tier: 'T1' | 'T2' | 'ADMIN'
  multiplier: number
  reviewsCompleted: number
  dailyReviewCount: number
  rollingAccuracyScore: number | null
  lastReviewAt: string | null
  queueSize: number
  recentReviewsLast7Days: number
  totalPaid: number
  totalPending: number
  recentEarnings: ReviewerEarning[]
}

export async function apiGetReviewerQueue(limit = 20): Promise<ReviewerQueueItem[]> {
  return apiFetch<ReviewerQueueItem[]>(`/api/reviews/queue/?limit=${limit}`)
}

export async function apiGetReviewerStats(): Promise<ReviewerStats> {
  return apiFetch<ReviewerStats>('/api/reviews/me/stats/')
}

export async function apiCreateReview(
  submissionId: string | number,
  payload: ReviewCreatePayload,
): Promise<Submission> {
  return apiFetch<Submission>(`/api/reviews/submissions/${submissionId}/`, {
    method: 'POST',
    body: payload,
  })
}
