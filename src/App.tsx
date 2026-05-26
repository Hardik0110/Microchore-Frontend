import { type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { LoginPage, SignupPage } from './pages/auth'
import {
  AttestStep,
  FirstTaskStep,
  LinkAccountStep,
  TutorialStep,
  VerifyEmailStep,
  WelcomeStep,
} from './pages/onboarding'
import {
  DashboardPage,
  EarningsPage,
  TaskDetailPage,
} from './pages/app'
import { MarketplacePage } from './pages/marketplace'
import { ProfilePage, SettingsPage } from './pages/account'
import { FeedbackPage } from './pages/feedback'
import { ReviewerPage } from './pages/reviewer'
import { SubmissionsPage } from './pages/submissions'
import {
  CompanyDashboardPage,
  CompanyNewProjectPage,
  CompanyNewTaskPage,
  CompanyProjectDetailPage,
  CompanyProjectsListPage,
} from './pages/company'
import { AppLayout, CompanyLayout, OnboardingLayout } from './components/layouts'
import { ApiLoader } from './components/ApiLoader'
import { AuthContext, useAuthProvider } from './lib/auth'

function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthProvider()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default function App() {
  return (
    <AuthProvider>
      <ApiLoader />
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
          <Route path="submissions" element={<SubmissionsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="reviewer" element={<ReviewerPage />} />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
