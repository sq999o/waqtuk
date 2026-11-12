import './EmptyState.css';
export function EmptyState({ title, message, action, className = '', ...rest }) {
  return <section {...rest} className={`wq-empty-state ${className}`}>
    {title != null && <h2 className="wq-empty-state-title">{title}</h2>}
    {message != null && <p className="wq-empty-state-message">{message}</p>}
    {action != null && <div className="wq-empty-state-action">{action}</div>}
  </section>;
}
