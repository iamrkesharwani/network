import { useState } from 'react';
import {
  REPORT_REASON_CATALOG,
  REPORT_NOTE_MAX_LENGTH,
  type ReportableContentType,
  type ReportReasonCode,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { useToast } from '../../../shared/hooks/useToast';
import { cn } from '../../../shared/utils/cn';
import { useCreateReportMutation } from '../reportApi';

export interface ReportModalProps {
  contentType: ReportableContentType;
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REASON_ENTRIES = Object.entries(REPORT_REASON_CATALOG) as [
  ReportReasonCode,
  { label: string },
][];

const ReportModal = ({
  contentType,
  contentId,
  isOpen,
  onClose,
}: ReportModalProps) => {
  const [reasonCode, setReasonCode] = useState<ReportReasonCode | null>(null);
  const [note, setNote] = useState('');
  const [createReport, { isLoading }] = useCreateReportMutation();
  const { addToast } = useToast();

  const handleClose = () => {
    setReasonCode(null);
    setNote('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!reasonCode) return;

    try {
      await createReport({
        contentType,
        contentId,
        reasonCode,
        ...(note.trim() && { note: note.trim() }),
      }).unwrap();
      addToast(
        'Report submitted. Thanks for helping keep the community safe.',
        'success'
      );
      handleClose();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your report. Please try again.';
      addToast(message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report content">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Tell us why you're reporting this. Reports are reviewed by the
          community jury.
        </p>

        <div className="flex flex-col gap-1.5">
          {REASON_ENTRIES.map(([code, { label }]) => (
            <label
              key={code}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
                reasonCode === code
                  ? 'border-primary bg-primary-muted text-text-primary'
                  : 'border-border text-text-secondary hover:bg-surface-raised'
              )}
            >
              <input
                type="radio"
                name="reportReason"
                className="accent-primary"
                checked={reasonCode === code}
                onChange={() => setReasonCode(code)}
              />
              {label}
            </label>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) =>
            setNote(e.target.value.slice(0, REPORT_NOTE_MAX_LENGTH))
          }
          placeholder="Additional details (optional)"
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!reasonCode}
          >
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
