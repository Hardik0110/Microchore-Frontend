import type { Notification, NotificationListResponse } from '../../types'
import { apiFetch } from './client'

export async function apiGetNotifications(opts: { unreadOnly?: boolean } = {}): Promise<NotificationListResponse> {
  const qs = opts.unreadOnly ? '?unread=1' : ''
  return apiFetch<NotificationListResponse>(`/api/auth/notifications/${qs}`)
}

export async function apiMarkNotificationRead(id: number): Promise<Notification> {
  return apiFetch<Notification>(`/api/auth/notifications/${id}/read/`, {
    method: 'POST',
  })
}

export async function apiMarkAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>(`/api/auth/notifications/read-all/`, {
    method: 'POST',
  })
}
