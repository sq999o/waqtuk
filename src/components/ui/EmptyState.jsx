// Phase 0 unstyled placeholder. Owner: Dev 4.
import './EmptyState.css';
export function EmptyState({ title, message, action, className = '', ...rest }) {
  return <section {...rest} className={`wq-empty-state ${className}`}><h2>{title}</h2><p>{message}</p>{action}</section>;
}
