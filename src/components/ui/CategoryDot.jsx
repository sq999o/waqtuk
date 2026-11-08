// Phase 0 unstyled placeholder. Owner: Dev 1.
import './CategoryDot.css';
export function CategoryDot({ color, size = 10, className = '', style, ...rest }) {
  return <svg {...rest} aria-hidden="true" className={`wq-category-dot ${className}`} width={size} height={size} viewBox="0 0 10 10" style={style}><circle cx="5" cy="5" r="5" fill={color} /></svg>;
}
