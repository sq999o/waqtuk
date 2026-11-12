// Select: a labelled dropdown built from an options list. Owner: Dev 2.
import './Select.css';
import { useId } from 'react';
export function Select({ label, name, value = '', onChange, options = [], placeholder, error, disabled, className = '', id, ...rest }) {
  const generated = useId(); const fieldId = id || generated;
  return <div className={`wq-select ${className}`}><label htmlFor={fieldId}>{label}</label>
    <select id={fieldId} {...rest} name={name} value={value} onChange={onChange} disabled={disabled}
      aria-invalid={Boolean(error)} aria-describedby={error ? `${fieldId}-help` : undefined}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {error && <p id={`${fieldId}-help`} className="wq-select-error">{error}</p>}
  </div>;
}
