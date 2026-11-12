// Button: the app's button, or a link styled as a button when `to` is set. Owner: Dev 2.
import './Button.css';
import { Link } from 'react-router-dom';
export function Button({ variant = 'primary', size = 'md', type = 'button', disabled, loading,
  fullWidth, iconLeft, to, onClick, children, className = '', ...rest }) {
  const cls = `wq-button wq-button--${variant} wq-button--${size} ${fullWidth ? 'wq-button--full' : ''} ${className}`;
  const content = <>{loading ? <span className="wq-button-spinner" aria-hidden="true" /> : iconLeft}{children}</>;
  if (to) return <Link {...rest} className={cls} to={to} aria-disabled={disabled || loading || undefined}
    tabIndex={disabled || loading ? -1 : rest.tabIndex}
    onClick={event => { if (disabled || loading) event.preventDefault(); else onClick?.(event); }}>{content}</Link>;
  return <button {...rest} className={cls} type={type} disabled={disabled || loading} onClick={onClick}>{content}</button>;
}
