import { apiFetch } from './client'

export type AdminSocialAccount = {
  platform: 'IG' | 'YT' | 'TIKTOK' | 'X'
  handle: string
  followerCount: number
  postCount: number
  accountAgeDays: number
  verifiedAt: string | null
}

export type AdminUser = {
  id: number
  email: string
  handle: string
  role: 'USER' | 'REVIEWER' | 'COMPANY_ADMIN' | 'PLATFORM_ADMIN'
  status: 'ACTIVE' | 'HELD' | 'BANNED'
  country: string
  emailVerified: boolean
  wizardStep: string
  starterApproved: number
  starterRejected: number
  createdAt: string | null
  socialAccounts: AdminSocialAccount[]
  averageRating: number | null
  approvedSubmissionCount: number
  submissionCount: number
  reviewerTier: 'T1' | 'T2' | 'ADMIN' | null
  reviewerMultiplier: number | null
  reviewsCompleted: number
  rollingAccuracyScore: number | null
}

export type AdminUserListResponse = {
  results: AdminUser[]
  limit: number
  offset: number
  total: number
}

export type AdminUserListQuery = {
  limit?: number
  offset?: number
  q?: string
  role?: string
}

export async function apiAdminListUsers(query: AdminUserListQuery = {}): Promise<AdminUserListResponse> {
  const params = new URLSearchParams()
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.offset != null) params.set('offset', String(query.offset))
  if (query.q) params.set('q', query.q)
  if (query.role) params.set('role', query.role)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<AdminUserListResponse>(`/api/auth/admin/users/${suffix}`)
}

export async function apiAdminPromoteReviewer(
  userId: number,
  payload: { tier?: 'T1' | 'T2' | 'ADMIN'; multiplier?: number } = {},
): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/auth/admin/users/${userId}/promote-reviewer/`, {
    method: 'POST',
    body: payload,
  })
}
