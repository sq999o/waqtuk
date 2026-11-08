// Phase 0 unstyled placeholder. Owner: Dev 1.
import './Toast.css';
// Toast props are not fixed in section 5.4; Dev 1 owns both caller and component.
export function Toast({ message, tone = 'success', children, className = '', ...rest }) {
  return <div {...rest} role="status" className={`wq-toast wq-toast--${tone} ${className}`}>{message ?? children}</div>;
}
