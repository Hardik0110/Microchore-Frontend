import type { Submission, SubmissionCreatePayload } from '../../types'
import { apiFetch } from './client'

export async function apiGetMySubmissions(): Promise<Submission[]> {
  const data = await apiFetch<Submission[] | { results: Submission[] }>('/api/submissions/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function apiCreateSubmission(payload: SubmissionCreatePayload): Promise<Submission> {
  return apiFetch<Submission>('/api/submissions/', {
    method: 'POST',
    body: payload,
  })
}

export async function apiReviewSubmission(
  id: string,
  decision: 'approved' | 'rejected',
  rating: 1 | 2 | 3 | 4 | 5,
  justification: string,
): Promise<Submission> {
  return apiFetch<Submission>(`/api/submissions/${id}/review/`, {
    method: 'POST',
    body: { decision, rating, justification },
  })
}
