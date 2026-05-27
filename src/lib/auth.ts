import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  apiGoogleSignIn,
  apiLogin,
  apiLogout,
  apiMe,
  apiPatchMe,
  apiSignup,
  clearTokens,
  getAccessToken,
} from './api'
import { resetMockData } from './store'

import type { Platform, LinkedAccount, WizardStep, User } from '../types/user'

export type { Platform, LinkedAccount, WizardStep, User }

const WIZARD_ORDER: WizardStep[] = [
  'signup',
  'verify-email',
  'welcome',
  'link-account',
  'attest',
  'tutorial',
  'first-task',
  'done',
]

export const WIZARD_ROUTES: Record<WizardStep, string> = {
  signup: '/signup',
  'verify-email': '/onboarding/verify-email',
  welcome: '/onboarding/welcome',
  'link-account': '/onboarding/link-account',
  attest: '/onboarding/attest',
  tutorial: '/onboarding/tutorial',
  'first-task': '/onboarding/first-task',
  done: '/app',
}

export function wizardStepIndex(step: WizardStep) {
  return WIZARD_ORDER.indexOf(step)
}

export function wizardNext(step: WizardStep): WizardStep {
  const idx = WIZARD_ORDER.indexOf(step)
  if (idx < 0 || idx >= WIZARD_ORDER.length - 1) return 'done'
  return WIZARD_ORDER[idx + 1]
}

export function wizardLabel(step: WizardStep) {
  const map: Record<WizardStep, string> = {
    signup: 'Sign up',
    'verify-email': 'Verify email',
    welcome: 'Welcome',
    'link-account': 'Link social account',
    attest: 'Attestation',
    tutorial: 'Tutorial',
    'first-task': 'First task',
    done: "You're in",
  }
  return map[step]
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isHydrating: boolean
  syncError: string | null
  signup: (email: string, password: string, extras?: { handle?: string; country?: string }) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  googleSignIn: (credential: string) => Promise<User>
  logout: () => Promise<void>
  updateUser: (patch: Partial<User>) => User | null
  setWizardStep: (step: WizardStep) => void
  advanceWizard: () => WizardStep | null
  refreshUser: () => Promise<User | null>
  clearSyncError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const REMOTE_PATCH_KEYS: Array<keyof User> = [
  'handle',
  'country',
  'emailVerified',
  'wizardStep',
  'starterApproved',
  'starterRejected',
  'attestedAt',
  'tutorialCompletedAt',
  'payoutMethod',
  'payoutHandle',
]

function pickRemotePatch(patch: Partial<User>): Partial<User> {
  const out: Partial<User> = {}
  for (const k of REMOTE_PATCH_KEYS) {
    if (k in patch) (out as Record<string, unknown>)[k as string] = patch[k] as unknown
  }
  return out
}

let hydrationPromise: Promise<User> | null = null

function hydrateMe(): Promise<User> {
  if (hydrationPromise) return hydrationPromise
  hydrationPromise = apiMe().finally(() => {
    hydrationPromise = null
  })
  return hydrationPromise
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrating, setIsHydrating] = useState<boolean>(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const userRef = useRef<User | null>(null)
  const clearSyncError = useCallback(() => setSyncError(null), [])

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    let cancelled = false
    if (!getAccessToken()) {
      setIsHydrating(false)
      return
    }
    hydrateMe()
      .then((u) => {
        if (cancelled) return
        userRef.current = u
        setUser(u)
      })
      .catch(() => {
        if (cancelled) return
        clearTokens()
        userRef.current = null
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsHydrating(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback((next: User | null) => {
    userRef.current = next
    setUser(next)
  }, [])

  const signup = useCallback<AuthContextValue['signup']>(async (email, password, extras = {}) => {
    const { user: fresh } = await apiSignup({
      email: email.trim().toLowerCase(),
      password,
      handle: extras.handle ?? '',
      country: extras.country ?? '',
    })
    commit(fresh)
    return fresh
  }, [commit])

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const { user: u } = await apiLogin(email.trim().toLowerCase(), password)
    commit(u)
    return u
  }, [commit])

  const googleSignIn = useCallback<AuthContextValue['googleSignIn']>(async (credential) => {
    const { user: u } = await apiGoogleSignIn(credential)
    commit(u)
    return u
  }, [commit])

  const logout = useCallback(async () => {
    const blacklistTask = apiLogout().catch(() => undefined)
    clearTokens()
    resetMockData()
    setSyncError(null)
    commit(null)
    await blacklistTask
  }, [commit])

  const updateUser = useCallback(
    (patch: Partial<User>): User | null => {
      const current = userRef.current
      if (!current) return null
      const next: User = { ...current, ...patch }
      commit(next)
      const remote = pickRemotePatch(patch)
      if (Object.keys(remote).length > 0) {
        apiPatchMe(remote).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Could not sync changes to server.'
          if (typeof console !== 'undefined') {
            console.error('apiPatchMe failed', err)
          }
          setSyncError(message)
        })
      }
      return next
    },
    [commit],
  )

  const setWizardStep = useCallback(
    (step: WizardStep) => {
      updateUser({ wizardStep: step })
    },
    [updateUser],
  )

  const advanceWizard = useCallback((): WizardStep | null => {
    const current = userRef.current
    if (!current) return null
    const nextStep = wizardNext(current.wizardStep)
    updateUser({ wizardStep: nextStep })
    return nextStep
  }, [updateUser])

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const fresh = await apiMe()
      commit(fresh)
      return fresh
    } catch {
      return null
    }
  }, [commit])

  return useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrating,
      syncError,
      signup,
      login,
      googleSignIn,
      logout,
      updateUser,
      setWizardStep,
      advanceWizard,
      refreshUser,
      clearSyncError,
    }),
    [user, isHydrating, syncError, signup, login, googleSignIn, logout, updateUser, setWizardStep, advanceWizard, refreshUser, clearSyncError],
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
