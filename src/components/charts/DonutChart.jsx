import { useId } from 'react';
import { percentages } from '../../utils/stats.js';
import { formatDuration } from '../../utils/time.js';
import './DonutChart.css';
export function DonutChart({ segments = [], centerValue, centerLabel, showLegend = true, className = '', ...rest }) {
  const id = useId();
  // Durations are whole minutes; invalid/negative input must never draw invalid SVG.
  const items = (Array.isArray(segments) ? segments : []).map(segment => ({
    ...segment, minutes: Number.isSafeInteger(segment.minutes) && segment.minutes > 0 ? segment.minutes : 0,
  }));
  const total = items.reduce((sum, item) => sum + item.minutes, 0);
  const shares = percentages(items.map(item => item.minutes));
  let offset = 0;
  const arcs = items.map(item => {
    const length = total ? item.minutes / total * 100 : 0;
    const arc = { ...item, length, offset };
    offset += length;
    return arc;
  });
  return <figure {...rest} className={`wq-donut-chart ${className}`}>
    <div className="wq-donut-chart-visual">
      <svg className="wq-donut-chart-svg" viewBox="0 0 200 200" role="img"
        aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
        <title id={`${id}-title`}>{centerLabel || 'Time distribution'}</title>
        <desc id={`${id}-description`}>{items.length
          ? items.map((item, i) => `${item.label}: ${formatDuration(item.minutes)}, ${shares[i]}%`).join('; ')
          : `${formatDuration(0)}, 0%`}</desc>
        <circle className="wq-donut-chart-track" cx="100" cy="100" r="76" />
        {arcs.filter(arc => arc.minutes > 0).map(arc => <circle key={arc.id} className="wq-donut-chart-segment"
          cx="100" cy="100" r="76" pathLength="100" stroke={arc.color || 'var(--muted)'}
          strokeDasharray={`${arc.length} ${100 - arc.length}`} strokeDashoffset={-arc.offset}
          transform="rotate(-90 100 100)" />)}
      </svg>
      <div className="wq-donut-chart-center">
        {centerValue != null && <span className="wq-donut-chart-value">{centerValue}</span>}
        {centerLabel != null && <span className="wq-donut-chart-label">{centerLabel}</span>}
      </div>
    </div>
    {showLegend && items.length > 0 && <ul className="wq-donut-chart-legend">{items.map((item, i) =>
      <li key={item.id} className="wq-donut-chart-legend-row">
        <span className="wq-donut-chart-name"><span className="wq-donut-chart-dot" aria-hidden="true"
          style={{ backgroundColor: item.color || 'var(--muted)' }} />{item.label}</span>
        <span className="wq-donut-chart-duration">{formatDuration(item.minutes)}</span>
        <span className="wq-donut-chart-percent">{shares[i]}%</span>
      </li>)}</ul>}
  </figure>;
}
