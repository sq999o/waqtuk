import './BarChart.css';
import { formatDuration } from '../../utils/time.js';

/*
  BarChart.jsx  (Owner: Dev 1)
  A hand-written SVG bar chart (no chart library).
  Props: data [{ key, label, minutes }], height (200), highlightMax (true: the tallest bar
  uses the strong color), ariaLabel. Bars start on the 0 baseline, values use formatDuration.
*/

// The drawing area is 600 units wide and scales with the container (width: 100%)
const WIDTH = 600;
const LABEL_SPACE = 24; // room under the bars for the labels
const VALUE_SPACE = 20; // room above the tallest bar for its value

export function BarChart({ data = [], height = 200, highlightMax = true, ariaLabel, className = '', ...rest }) {
  // Never 0, so the division below is always safe
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

  const slot = data.length > 0 ? WIDTH / data.length : WIDTH;
  const barWidth = slot * 0.6;
  const chartHeight = height - LABEL_SPACE - VALUE_SPACE;
  const baseline = height - LABEL_SPACE;

  // Index of the tallest bar (the first one wins a tie), or -1 when nothing is highlighted
  const maxIndex = highlightMax
    ? data.findIndex(d => d.minutes === maxMinutes)
    : -1;

  // Screen readers read this text when the page does not pass an ariaLabel
  const label = ariaLabel || data.map(d => `${d.label} ${formatDuration(d.minutes)}`).join(', ');

  return (
    <svg
      {...rest}
      role="img"
      aria-label={label}
      className={`wq-bar-chart ${className}`}
      width="100%"
      height={height}
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1={baseline}
        x2={WIDTH}
        y2={baseline}
        className="wq-bar-chart-baseline"
      />

      {data.map((item, index) => {
        const barHeight = (item.minutes / maxMinutes) * chartHeight;
        const x = index * slot + (slot - barWidth) / 2;
        // SVG y grows downwards, so a taller bar starts higher
        const y = baseline - barHeight;
        const centerX = x + barWidth / 2;

        const strong = index === maxIndex;

        return (
          <g key={item.key}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              className={`wq-bar-chart-bar ${strong ? 'wq-bar-chart-bar--strong' : ''}`}
            />

            <text
              x={centerX}
              y={y - 5}
              textAnchor="middle"
              className="wq-bar-chart-value"
            >
              {formatDuration(item.minutes)}
            </text>

            <text
              x={centerX}
              y={height - 6}
              textAnchor="middle"
              className="wq-bar-chart-label"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}