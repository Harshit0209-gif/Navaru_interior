import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// Class component because React only supports error boundaries via
// getDerivedStateFromError/componentDidCatch — there's no hook equivalent.
// Without this, any uncaught render-time error (e.g. an unexpected Supabase
// response shape) unmounts the whole tree and leaves a blank white screen.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 py-16 text-center text-cream-100">
        <p className="text-xs font-medium uppercase tracking-widest2 text-brass-300">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">
          We hit an unexpected error.
        </h1>
        <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-cream-200/70">
          Please try reloading the page. If the problem keeps happening, let us know what you
          were doing when it occurred.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-8 border-b border-brass-300 pb-1 text-xs font-medium uppercase tracking-widest2 text-brass-300 transition-colors hover:text-brass-200"
        >
          Return to Home
        </button>
      </div>
    )
  }
}
