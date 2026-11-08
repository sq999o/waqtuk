// Phase 0 chart placeholder. Owner: Dev 1. No bars or totals yet.
import './BarChart.css';
export function BarChart({ data = [], height = 200, highlightMax = true, ariaLabel, className = '', ...rest }) {
  return <svg {...rest} role="img" aria-label={ariaLabel || 'Bar chart placeholder'} className={`wq-bar-chart ${className}`} width="100%" height={height} />;
}
