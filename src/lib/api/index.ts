export {
  API_URL,
  ApiError,
  apiFetch,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getApiInflightCount,
  subscribeApiInflight,
  subscribeSessionExpired,
  type FetchOpts,
} from './client'

export {
  apiSignup,
  apiLogin,
  apiGoogleSignIn,
  apiMe,
  apiPatchMe,
  apiLogout,
  apiRequestEmailVerify,
  apiConfirmEmailVerify,
} from './auth'

export {
  apiAdminListUsers,
  apiAdminPromoteReviewer,
  type AdminUser,
  type AdminSocialAccount,
  type AdminUserListResponse,
  type AdminUserListQuery,
} from './admin'

export { apiLinkYouTube, apiLinkInstagram, apiTwitterStartLink } from './social'

export { apiGetTasks, apiGetTask, apiClaimTask } from './tasks'

export {
  apiGetProjects,
  apiCreateProject,
  apiUpdateProjectStatus,
  apiCreateProjectTask,
} from './projects'

export {
  apiGetMySubmissions,
  apiCreateSubmission,
  apiReviewSubmission,
} from './submissions'

export {
  apiGetReviewerQueue,
  apiGetReviewerStats,
  apiCreateReview,
  type ReviewerStats,
  type ReviewerEarning,
} from './reviews'

export { apiGetMyEarnings } from './earnings'

export {
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from './notifications'

export type {
  Claim,
  ReviewerQueueItem,
  ReviewCreatePayload,
} from '../../types'
