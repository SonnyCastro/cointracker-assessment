import { Component, ReactNode, ErrorInfo } from "react"
import "./ErrorBoundary.css"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: sendErrorToService(error, errorInfo)
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.handleRetry}
          />
        )
      }

      // Default error UI
      return (
        <div className='error-boundary'>
          <div className='error-boundary-content'>
            <div className='error-boundary-icon'>⚠️</div>
            <h2 className='error-boundary-title'>Something went wrong</h2>
            <p className='error-boundary-message'>
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className='error-boundary-details'>
                <summary>Error Details (Development Only)</summary>
                <pre className='error-boundary-stack'>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className='error-boundary-actions'>
              <button
                className='error-boundary-retry-button'
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button
                className='error-boundary-refresh-button'
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
