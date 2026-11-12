
import './ConfirmDialog.css';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'default',
  className = '',
  ...rest
}) {
  const confirmVariant = tone === 'danger' ? 'danger' : 'primary';
  const dialogTone = tone === 'danger' ? 'danger' : 'default';

  const footer = (
    <>
      <Button variant="secondary" onClick={onCancel}>
        {cancelLabel}
      </Button>

      <Button variant={confirmVariant} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      {...rest}
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={footer}
      className={[
        'wq-confirm-dialog',
        `wq-confirm-dialog--${dialogTone}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      <p className="wq-confirm-dialog__message">
        {message}
      </p>
    </Modal>
  );
}
