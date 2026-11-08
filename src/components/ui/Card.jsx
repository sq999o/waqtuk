// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Card.css';
export function Card({ title, action, padding = 'md', children, className = '', ...rest }) {
  return <section {...rest} className={`wq-card wq-card--${padding} ${className}`}>{(title || action) && <header><h2>{title}</h2>{action}</header>}{children}</section>;
}
