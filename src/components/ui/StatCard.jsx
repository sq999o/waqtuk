import './StatCard.css';
export function StatCard({ label, value, hint, tone = 'neutral', className = '', ...rest }) {
  const hintTone = ['neutral', 'success', 'warning', 'danger', 'info'].includes(tone) ? tone : 'neutral';
  return <section {...rest} className={`wq-stat-card ${className}`}>
    <h2 className="wq-stat-card-label">{label}</h2>
    <p className="wq-stat-card-value">{value}</p>
    {hint != null && <p className={`wq-stat-card-hint wq-stat-card-hint--${hintTone}`}>{hint}</p>}
  </section>;
}
