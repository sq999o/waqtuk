// Phase 0 unstyled placeholder. Owner: Dev 3.
import './ConfirmDialog.css';
import { Modal } from './Modal';
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default', onConfirm, onCancel, className = '', ...rest }) {
  return <Modal {...rest} open={open} title={title} onClose={onCancel} className={`wq-confirm-dialog wq-confirm-dialog--${tone} ${className}`}
    footer={<><button type="button" onClick={onCancel}>{cancelLabel}</button><button type="button" onClick={onConfirm}>{confirmLabel}</button></>}><p>{message}</p></Modal>;
}
