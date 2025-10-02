import './ErrorState.css'

/**
 * Reusable error state component
 */
const ErrorState = ({ 
  title = 'Error', 
  message, 
  isRetrying = false, 
  retryCount = 0, 
  maxRetries = 5,
  onRetry,
  className = '' 
}) => {
  const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000)
  const retryInSeconds = Math.ceil(retryDelay / 1000)

  return (
    <div className={`error-state ${className}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-message">
          <div className="error-title">{title}</div>
          <div className="error-details">{message}</div>
          {isRetrying && retryCount < maxRetries && (
            <div className="retry-info">
              Retrying in {retryInSeconds} seconds... (Attempt {retryCount + 1}/{maxRetries})
            </div>
          )}
          {retryCount >= maxRetries && (
            <div className="retry-info">
              Max retry attempts reached. Please check your connection.
            </div>
          )}
        </div>
        {!isRetrying && retryCount < maxRetries && onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Try Again Now
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorState
