import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ErrorMessageProps } from '../types.ts'

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle className="error-icon" />
        <div className="error-text">
          <h4>Fehler</h4>
          <p>{error}</p>
        </div>
      </div>
      
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          <RefreshCw className="icon" />
          Erneut versuchen
        </button>
      )}
    </div>
  )
}
