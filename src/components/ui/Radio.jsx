// Radio: one radio button with its label; the page draws several with the same name. Owner: Dev 2.
import './Radio.css';
export function Radio({ label, name, value, checked = false, onChange, disabled, className = '', ...rest }) {
  return (
    <label className={`wq-radio ${disabled ? 'wq-radio--disabled' : ''} ${className}`}>
      <input {...rest} type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} />
      {label}
    </label>
  );
}
