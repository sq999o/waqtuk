// Phase 0 unstyled placeholder. Owner: Dev 1.
import './ProgressBar.css';
export function ProgressBar({ value = 0, max = 100, tone = 'primary', label, className = '', ...rest }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, value / max * 100)) : 0;
  return <progress {...rest} className={`wq-progress-bar wq-progress-bar--${tone} ${className}`} value={percent} max={100} aria-label={label} />;
}
