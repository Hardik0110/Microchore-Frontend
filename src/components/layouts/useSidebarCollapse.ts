import { useCallback, useState } from 'react'
import { SIDEBAR_STORAGE_KEY } from '../../constants/storage'

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  return { collapsed, toggleCollapsed }
}
