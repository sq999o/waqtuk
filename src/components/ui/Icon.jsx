// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Icon.css';
export function Icon({ name, size = 20, className = '', ...rest }) {
  return <svg {...rest} className={`wq-icon ${className}`} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" data-icon={name} />;
}
