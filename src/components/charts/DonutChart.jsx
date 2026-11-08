// Phase 0 chart placeholder. Owner: Dev 4. No geometry or legend calculations yet.
import './DonutChart.css';
export function DonutChart({ segments = [], centerValue, centerLabel, showLegend = true, className = '', ...rest }) {
  return <figure {...rest} className={`wq-donut-chart ${className}`}><figcaption>{centerValue} {centerLabel}</figcaption>
    {showLegend && <ul>{segments.map(segment => <li key={segment.id}>{segment.label}</li>)}</ul>}
  </figure>;
}
