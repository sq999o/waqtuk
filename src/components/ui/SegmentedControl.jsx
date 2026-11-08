// Phase 0 unstyled placeholder. Owner: Dev 3.
import './SegmentedControl.css';
export function SegmentedControl({ options = [], value, onChange, className = '', ...rest }) {
  return <div {...rest} className={`wq-segmented-control ${className}`} role="group">
    {options.map(option => <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange?.(option.value)}>{option.label}</button>)}
  </div>;
}
