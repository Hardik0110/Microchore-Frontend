export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'x'

export type LinkedAccount = {
  platform: Platform
  handle: string
  followers: number
  posts: number
  ageDays: number
  verifiedAt: string
  passesCredibility: boolean
}

export type WizardStep =
  | 'signup'
  | 'verify-email'
  | 'welcome'
  | 'link-account'
  | 'attest'
  | 'tutorial'
  | 'first-task'
  | 'done'

export type UserRole = 'USER' | 'REVIEWER' | 'COMPANY_ADMIN' | 'PLATFORM_ADMIN'

export type User = {
  id: string | number
  email: string
  handle?: string
  country?: string
  role?: UserRole
  createdAt: string
  emailVerified: boolean
  wizardStep: WizardStep
  linkedAccount?: LinkedAccount | null
  attestedAt?: string | null
  tutorialCompletedAt?: string | null
  starterApproved: number
  starterRejected: number
  realTasksUnlocked: boolean
  holdReason?: string | null
  payoutMethod?: 'airtm' | 'paypal' | 'crypto' | null
  payoutHandle?: string | null
  isReviewer?: boolean
}
