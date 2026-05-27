import type { Submission } from './submission'

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
