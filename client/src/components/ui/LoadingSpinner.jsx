import './LoadingSpinner.css'

/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ text = 'Loading...', size = 'medium', className = '' }) => {
  return (
    <div className={`loading-spinner-container ${size} ${className}`}>
      <div className="loading-spinner"></div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  )
}

export default LoadingSpinner
