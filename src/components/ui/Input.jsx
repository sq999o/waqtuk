// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Input.css';
import { useId } from 'react';
export function Input({ label, name, type = 'text', value = '', onChange, placeholder, error, hint,
  required, disabled, iconLeft, className = '', id, ...rest }) {
  const generated = useId(); const fieldId = id || generated;
  return <div {...rest} className={`wq-input ${className}`}>
    <label htmlFor={fieldId}>{label}</label>{iconLeft}
    <input id={fieldId} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
      required={required} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${fieldId}-help` : undefined} />
    {(error || hint) && <p id={`${fieldId}-help`}>{error || hint}</p>}
  </div>;
}
