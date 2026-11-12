// Alert: a coloured message box (info, success, warning, danger) with the prototype icons. Owner: Dev 2.
import './Alert.css';

const ICONS = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" /></>,
  success: <path d="M20 6L9 17l-5-5" />,
  warning: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>,
  danger: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>,
};

export function Alert({ tone = 'info', title, onClose, children, className = '', ...rest }) {
  // Errors and warnings interrupt a screen reader; info and success are announced politely.
  const role = tone === 'danger' || tone === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} {...rest} className={`wq-alert wq-alert--${tone} ${className}`}>
      <svg className="wq-alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[tone] ?? ICONS.info}
      </svg>
      <div className="wq-alert-body">
        {title && <strong className="wq-alert-title">{title}</strong>}
        {children}
      </div>
      {onClose && <button type="button" className="wq-alert-close" onClick={onClose} aria-label="Close alert">×</button>}
    </div>
  );
}
