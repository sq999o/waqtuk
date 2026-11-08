// Phase 0 unstyled placeholder. Owner: Dev 2.
import './Radio.css';
export function Radio({ label, name, value, checked = false, onChange, disabled, className = '', ...rest }) {
  return <label {...rest} className={`wq-radio ${className}`}><input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} />{label}</label>;
}
