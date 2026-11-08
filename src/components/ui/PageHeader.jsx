// Phase 0 unstyled placeholder. Owner: Dev 2.
import './PageHeader.css';
export function PageHeader({ title, subtitle, actions, className = '', ...rest }) {
  return <header {...rest} className={`wq-page-header ${className}`}><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}{actions}</header>;
}
