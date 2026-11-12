// Input: a labelled text field with an optional hint or error. Owner: Dev 2.
import './Input.css';
import { useId } from 'react';
export function Input({ label, name, type = 'text', value = '', onChange, placeholder, error, hint,
  required, disabled, iconLeft, className = '', id, ...rest }) {
  const generated = useId(); const fieldId = id || generated;
  return <div className={`wq-input ${className}`}>
    <label htmlFor={fieldId}>{label}{required && <span className="wq-input-star" aria-hidden="true"> *</span>}</label>{iconLeft}
    <input id={fieldId} {...rest} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
      required={required} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${fieldId}-help` : undefined} />
    {(error || hint) && <p id={`${fieldId}-help`} className={error ? 'wq-input-error' : 'wq-input-hint'}>{error || hint}</p>}
  </div>;
}
