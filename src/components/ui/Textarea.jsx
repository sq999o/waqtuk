// Textarea: a labelled multi-line text field with an optional hint or error. Owner: Dev 2.
import './Textarea.css';
import { useId } from 'react';
export function Textarea({ label, name, value = '', onChange, rows = 3, maxLength, placeholder, error, hint, className = '', id, ...rest }) {
  const generated = useId(); const fieldId = id || generated;
  return <div className={`wq-textarea ${className}`}><label htmlFor={fieldId}>{label}</label>
    <textarea id={fieldId} {...rest} name={name} value={value} onChange={onChange} rows={rows} maxLength={maxLength}
      placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${fieldId}-help` : undefined} />
    {(error || hint) && <p id={`${fieldId}-help`} className={error ? 'wq-textarea-error' : 'wq-textarea-hint'}>{error || hint}</p>}
  </div>;
}
