// Phase 0 unstyled placeholder. Owner: Dev 1.
import './Badge.css';
export function Badge({ tone = 'neutral', children, className = '', ...rest }) {
  return <span {...rest} className={`wq-badge wq-badge--${tone} ${className}`}>{children}</span>;
}
