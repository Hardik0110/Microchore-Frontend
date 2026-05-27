import type { EarningsSummary } from '../../types'
import { apiFetch } from './client'

export async function apiGetMyEarnings(): Promise<EarningsSummary> {
  return apiFetch<EarningsSummary>('/api/earnings/')
}
