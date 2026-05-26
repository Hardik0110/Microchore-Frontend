import { useSyncExternalStore } from 'react'
import { getApiInflightCount, subscribeApiInflight } from '../lib/api'

const SERVER_SNAPSHOT = () => 0

export function ApiLoader() {
  const count = useSyncExternalStore(subscribeApiInflight, getApiInflightCount, SERVER_SNAPSHOT)
  if (count <= 0) return null
  return (
    <>
      <style>{`@keyframes microchoreApiLoaderSweep{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}`}</style>
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] overflow-hidden bg-grey-soft/70 pointer-events-none"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <div
          className="h-full w-[45%] bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.45)]"
          style={{ animation: 'microchoreApiLoaderSweep 1.15s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
        />
      </div>
    </>
  )
}
