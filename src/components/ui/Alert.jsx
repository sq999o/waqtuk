// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Alert.css';
export function Alert({ tone = 'info', title, onClose, children, className = '', ...rest }) {
  return <div {...rest} role="alert" className={`wq-alert wq-alert--${tone} ${className}`}>
    {title && <strong>{title}</strong>}{children}{onClose && <button type="button" onClick={onClose} aria-label="Close alert">×</button>}
  </div>;
}
