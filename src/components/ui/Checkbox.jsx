// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Checkbox.css';
export function Checkbox({ label, name, checked = false, onChange, disabled, className = '', ...rest }) {
  return <label {...rest} className={`wq-checkbox ${className}`}><input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled} />{label}</label>;
}
