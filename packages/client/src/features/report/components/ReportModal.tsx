import { useState } from 'react';
import { CheckCircle2, ShieldOff } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { cn } from '../../../shared/utils/cn';
import { useCreateReportMutation } from '../reportApi';
import { useBlockUserMutation } from '../../block/blockApi';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import {
  REPORT_REASON_CATALOG,
  REPORT_NOTE_MAX_LENGTH,
  REPORT_DISCLOSED_CONTENT_MAX_LENGTH,
  type ReportableContentType,
  type ReportReasonCode,
} from '@network/shared';

export interface ReportModalProps {
  contentType: ReportableContentType;
  contentId: string;
  authorId: string;
  /** Overrides the authorId-based "is this your own content" check - needed
   * for conversation reports, which have no single clean authorId. */
  isOwnContent?: boolean;
  /** Pre-fills the required disclosure field for message reports, typically
   * the message text already decrypted client-side for display. */
  initialDisclosedContent?: string;
  /** When set, offers a "Also block this person" checkbox alongside the report. */
  blockTarget?: { username: string; name: string };
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
  authorId,
  isOwnContent: isOwnContentOverride,
  initialDisclosedContent,
  blockTarget,
  isOpen,
  onClose,
}: ReportModalProps) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwnContent =
    isOwnContentOverride ?? (!!currentUserId && currentUserId === authorId);
  const needsDisclosedContent = contentType === 'message';

  const [reasonCode, setReasonCode] = useState<ReportReasonCode | null>(null);
  const [note, setNote] = useState('');
  const [disclosedContent, setDisclosedContent] = useState(
    initialDisclosedContent ?? ''
  );
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createReport, { isLoading }] = useCreateReportMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const { addToast } = useToast();

  const handleClose = () => {
    setReasonCode(null);
    setNote('');
    setDisclosedContent(initialDisclosedContent ?? '');
    setAlsoBlock(false);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!reasonCode) return;
    if (needsDisclosedContent && !disclosedContent.trim()) return;

    try {
      await createReport({
        contentType,
        contentId,
        reasonCode,
        ...(note.trim() && { note: note.trim() }),
        ...(needsDisclosedContent && {
          disclosedContent: disclosedContent.trim(),
        }),
      }).unwrap();

      if (alsoBlock && blockTarget) {
        await blockUser(blockTarget.username).catch(() => undefined);
      }

      setSubmitted(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your report. Please try again.';
      addToast(message, 'error');
      handleClose();
    }
  };

  if (isOwnContent) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Can't report your own content"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-alt">
            <ShieldOff className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-secondary">
            You can't report your own content. If you'd like it taken down,
            delete it or make it unlisted from its options menu instead.
          </p>
          <Button size="sm" onClick={handleClose} className="w-full sm:w-auto">
            Got it
          </Button>
        </div>
      </Modal>
    );
  }

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Report submitted">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted">
            <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-secondary">
            Thanks for reporting this. Our community jury will review it and
            take action if needed.
          </p>
          <Button size="sm" onClick={handleClose} className="w-full sm:w-auto">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

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
                  : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-raised'
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

        {needsDisclosedContent && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              What did the message say? Messages are end-to-end encrypted, so
              we can only review what you tell us you saw.
            </label>
            <textarea
              value={disclosedContent}
              onChange={(e) =>
                setDisclosedContent(
                  e.target.value.slice(0, REPORT_DISCLOSED_CONTENT_MAX_LENGTH)
                )
              }
              placeholder="Paste or describe the message content"
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <textarea
          value={note}
          onChange={(e) =>
            setNote(e.target.value.slice(0, REPORT_NOTE_MAX_LENGTH))
          }
          placeholder="Additional details (optional)"
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {blockTarget && (
          <label className="flex items-center gap-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              className="accent-primary"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
            />
            Also block {blockTarget.name}
          </label>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading || isBlocking}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading || isBlocking}
            disabled={
              !reasonCode ||
              (needsDisclosedContent && !disclosedContent.trim())
            }
          >
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;
