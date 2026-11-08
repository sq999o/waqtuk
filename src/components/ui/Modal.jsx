// Phase 0 unstyled placeholder. Owner: Dev 3.
import './Modal.css';
// Placeholder only: Dev 3 adds focus handling, Esc, backdrop and scroll locking.
export function Modal({ open, title, onClose, footer, size = 'md', children, className = '', ...rest }) {
  if (!open) return null;
  return <section {...rest} role="dialog" aria-label={title} className={`wq-modal wq-modal--${size} ${className}`}>
    <h2>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">×</button>{children}{footer}
  </section>;
}
