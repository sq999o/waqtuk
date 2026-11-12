
import { useEffect, useId, useState } from 'react';
import {
  Modal,
  Select,
  Textarea,
  Alert,
  Button,
} from '../../../components/ui';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../context/ToastContext';
import './ReportDialog.css';

const REASON_OPTIONS = [
  { value: 'Inappropriate language', label: 'Inappropriate language' },
  { value: 'Harassment', label: 'Harassment' },
  { value: 'Spam', label: 'Spam' },
  { value: 'Other', label: 'Other' },
];

export default function ReportDialog({
  open,
  onClose,
  item,
}) {
  const { reportFeedback } = useData();
  const toast = useToast();

  const formId = useId();

  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  // Reset the form every time it opens or the item changes.
  useEffect(() => {
    if (!open) return;

    setReason('');
    setDetails('');
    setError('');
  }, [open, item?.id]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!item) return;

    const result = reportFeedback(
      item.id,
      reason,
      details
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    onClose();
    toast.show('Report submitted for review.');
  }

  return (
    <Modal
      open={open}
      title="Report content"
      onClose={onClose}
      size="sm"
      className="wq-reportdialog-modal"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form={formId}
          >
            Submit Report
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="wq-reportdialog-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Select
          label="Reason *"
          name="reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          options={REASON_OPTIONS}
          placeholder="Select reason"
          error={error}
        />

        <Textarea
          label="Details (optional)"
          name="details"
          value={details}
          onChange={(event) =>
            setDetails(event.target.value)
          }
          placeholder="Add details..."
          rows={4}
        />

        <Alert tone="info">
          Reporting does not remove the content automatically.
        </Alert>
      </form>
    </Modal>
  );
}
