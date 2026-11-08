// Phase 0 placeholder. Owner: Dev 1. The real form comes in Phase 2.
import { Modal } from '../../../components/ui';
import { TODAY } from '../../../utils/time';
export default function ActivityFormModal({ open, onClose, activity = null, defaultDate = TODAY }) {
  return <Modal open={open} onClose={onClose} title={activity ? 'Edit Activity' : 'Add Activity'}>
    <p>Activity form placeholder ({defaultDate})</p>
  </Modal>;
}
