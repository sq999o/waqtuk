// Phase 0 unstyled placeholder. Owner: Dev 1.

import './CategoryDot.css';

export function CategoryDot({ color, size = 10, className = '', style, ...rest }) {
  return (
    <svg
      {...rest}
      className={`wq-category-dot ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <circle cx="5" cy="5" r="5" fill={color} />
    </svg>
  );
}

