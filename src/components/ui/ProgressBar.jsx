// Phase 0 unstyled placeholder. Owner: Dev 1.

import './ProgressBar.css';

export function ProgressBar({ value = 0, max = 100, tone = 'primary', label, className = '', ...rest }) {

  let percent = 0;

  if (max > 0) {
    percent = Math.min(100, Math.max(0, (value / max) * 100));
  }

  return (
    <div
      {...rest}
      className={`wq-progress-bar wq-progress-bar--${tone} ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="wq-progress-bar-fill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

