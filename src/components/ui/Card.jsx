// Card: a bordered box with an optional title row (title on the left, action on the right). Owner: Dev 2.
import './Card.css';
export function Card({ title, action, padding = 'md', children, className = '', ...rest }) {
  return (
    <section {...rest} className={`wq-card wq-card--${padding} ${className}`}>
      {(title || action) && (
        <header className="wq-card-header">
          {title && <h2 className="wq-card-title">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
