export type NotificationKind =
  | 'submission_approved'
  | 'submission_rejected'
  | 'real_tasks_unlocked'
  | 'promoted_to_reviewer'
  | 'account_held'
  | 'system'

export type Notification = {
  id: number
  kind: NotificationKind
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export type NotificationListResponse = {
  results: Notification[]
  unreadCount: number
}
