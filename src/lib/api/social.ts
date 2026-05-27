import type { LinkedAccount } from '../../types'
import { apiFetch } from './client'

export async function apiLinkYouTube(accessToken: string): Promise<{ linkedAccount: LinkedAccount }> {
  return apiFetch<{ linkedAccount: LinkedAccount }>('/api/auth/social/youtube/', {
    method: 'POST',
    body: { access_token: accessToken },
  })
}

export async function apiTwitterStartLink(): Promise<{ authorize_url: string }> {
  return apiFetch<{ authorize_url: string }>('/api/auth/social/twitter/start/', {
    method: 'POST',
  })
}
