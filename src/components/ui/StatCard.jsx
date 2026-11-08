// Phase 0 unstyled placeholder. Owner: Dev 4.
import './StatCard.css';
export function StatCard({ label, value, hint, tone = 'neutral', className = '', ...rest }) {
  return <section {...rest} className={`wq-stat-card ${className}`}><h2>{label}</h2><p>{value}</p>{hint && <p className={`wq-stat-card-hint--${tone}`}>{hint}</p>}</section>;
}
