import './Toast.css';

// A small message box shown by ToastContext. Colors and position are in Toast.css.
export function Toast({ message, tone = 'success', children, className = '', ...rest }) {
  // Shared SVG settings: 16px icon that takes the text color
  const iconProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  let icon;

  if (tone === 'success') {
    icon = (
      <svg {...iconProps}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  } else if (tone === 'error') {
    icon = (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </svg>
    );
  } else {
    icon = (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 11v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }

  return (
    <div {...rest} role="status" className={`wq-toast wq-toast--${tone} ${className}`}>
      {icon}
      <span className="wq-toast-text">{message ?? children}</span>
    </div>
  );
}
