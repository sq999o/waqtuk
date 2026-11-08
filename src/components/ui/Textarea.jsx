// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Textarea.css';
import { useId } from 'react';
export function Textarea({ label, name, value = '', onChange, rows = 3, maxLength, placeholder, error, hint, className = '', id, ...rest }) {
  const generated = useId(); const fieldId = id || generated;
  return <div {...rest} className={`wq-textarea ${className}`}><label htmlFor={fieldId}>{label}</label>
    <textarea id={fieldId} name={name} value={value} onChange={onChange} rows={rows} maxLength={maxLength} placeholder={placeholder} aria-invalid={Boolean(error)} />
    {(error || hint) && <p>{error || hint}</p>}
  </div>;
}
