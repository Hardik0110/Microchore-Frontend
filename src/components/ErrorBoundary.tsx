import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('Unhandled render error:', error, info.componentStack)
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset)
      return (
        <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <p className="font-mono text-2xs tracking-stamp uppercase text-ink-3 mb-2">
              Something broke
            </p>
            <h1 className="font-serif text-2xl text-ink mb-3">
              The page hit an error.
            </h1>
            <p className="text-sm text-ink-2 mb-6">
              Reloading usually fixes it. If it keeps happening, contact support.
            </p>
            <button
              type="button"
              onClick={() => {
                this.reset()
                if (typeof window !== 'undefined') window.location.reload()
              }}
              className="inline-flex items-center rounded-md bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-deep transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
