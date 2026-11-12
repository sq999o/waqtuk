// PageHeader: the page title and subtitle, with action buttons on the right. Owner: Dev 2.
import './PageHeader.css';
export function PageHeader({ title, subtitle, actions, className = '', ...rest }) {
  return (
    <header {...rest} className={`wq-page-header ${className}`}>
      <div className="wq-page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="wq-page-header-actions">{actions}</div>}
    </header>
  );
}
