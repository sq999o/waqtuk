// Checkbox: one checkbox with its label. Extra props go to the <input>. Owner: Dev 2.
import './Checkbox.css';
export function Checkbox({ label, name, checked = false, onChange, disabled, className = '', ...rest }) {
  return (
    <label className={`wq-checkbox ${disabled ? 'wq-checkbox--disabled' : ''} ${className}`}>
      <input {...rest} type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled} />
      {label}
    </label>
  );
}
