import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout, CompanyLayout, OnboardingLayout } from './components/layouts'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ApiLoader } from './components/ApiLoader'
import { AuthContext, useAuthProvider } from './lib/auth'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/auth').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/auth').then((m) => ({ default: m.SignupPage })))

const AttestStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.AttestStep })))
const FirstTaskStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.FirstTaskStep })))
const LinkAccountStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.LinkAccountStep })))
const TutorialStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.TutorialStep })))
const VerifyEmailStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.VerifyEmailStep })))
const WelcomeStep = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.WelcomeStep })))

const DashboardPage = lazy(() => import('./pages/app').then((m) => ({ default: m.DashboardPage })))
const EarningsPage = lazy(() => import('./pages/app').then((m) => ({ default: m.EarningsPage })))
const TaskDetailPage = lazy(() => import('./pages/app').then((m) => ({ default: m.TaskDetailPage })))

const MarketplacePage = lazy(() => import('./pages/marketplace').then((m) => ({ default: m.MarketplacePage })))
const ProfilePage = lazy(() => import('./pages/account').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('./pages/account').then((m) => ({ default: m.SettingsPage })))
const FeedbackPage = lazy(() => import('./pages/feedback').then((m) => ({ default: m.FeedbackPage })))
const ReviewerQueuePage = lazy(() => import('./pages/reviewer').then((m) => ({ default: m.ReviewerQueuePage })))
const SubmissionsPage = lazy(() => import('./pages/submissions').then((m) => ({ default: m.SubmissionsPage })))

const CompanyDashboardPage = lazy(() => import('./pages/company').then((m) => ({ default: m.CompanyDashboardPage })))
const CompanyNewProjectPage = lazy(() => import('./pages/company').then((m) => ({ default: m.CompanyNewProjectPage })))
const CompanyNewTaskPage = lazy(() => import('./pages/company').then((m) => ({ default: m.CompanyNewTaskPage })))
const CompanyProjectDetailPage = lazy(() => import('./pages/company').then((m) => ({ default: m.CompanyProjectDetailPage })))
const CompanyProjectsListPage = lazy(() => import('./pages/company').then((m) => ({ default: m.CompanyProjectsListPage })))

const AdminUsersPage = lazy(() => import('./pages/admin').then((m) => ({ default: m.AdminUsersPage })))

function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthProvider()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div
        className="h-6 w-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin"
        aria-label="Loading"
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ApiLoader />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingLayout />}>
              <Route index element={<Navigate to="/onboarding/verify-email" replace />} />
              <Route path="verify-email" element={<VerifyEmailStep />} />
              <Route path="welcome" element={<WelcomeStep />} />
              <Route path="link-account" element={<LinkAccountStep />} />
              <Route path="attest" element={<AttestStep />} />
              <Route path="tutorial" element={<TutorialStep />} />
              <Route path="first-task" element={<FirstTaskStep />} />
            </Route>

            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="tasks" element={<Navigate to="/app/marketplace" replace />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="queue" element={<ReviewerQueuePage />} />
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="/company" element={<CompanyLayout />}>
              <Route index element={<CompanyDashboardPage />} />
              <Route path="projects" element={<CompanyProjectsListPage />} />
              <Route path="projects/new" element={<CompanyNewProjectPage />} />
              <Route path="projects/:id" element={<CompanyProjectDetailPage />} />
              <Route path="projects/:id/tasks/new" element={<CompanyNewTaskPage />} />
            </Route>

            <Route path="/admin/users" element={<AdminUsersPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  )
}
