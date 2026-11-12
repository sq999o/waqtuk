// Phase 0 unstyled placeholder. Owner: Dev 1.

import './Badge.css';

export function Badge({ tone = 'neutral', children, className = '', ...rest }) {
  const classes = `wq-badge wq-badge--${tone} ${className}`;

  return (
    <span {...rest} className={classes}>
      {children}
    </span>
  );
}

