import { useState } from 'react';
import type { ReportableContentType } from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import Spinner from '../../../shared/ui/primitives/Spinner';
import { useToast } from '../../../shared/hooks/useToast';
import { useGetCaseForContentQuery, useCreateAppealMutation } from '../juryApi';

export interface AppealModalProps {
  contentType: ReportableContentType;
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AppealModal = ({
  contentType,
  contentId,
  isOpen,
  onClose,
}: AppealModalProps) => {
  const [reason, setReason] = useState('');
  const { data, isLoading } = useGetCaseForContentQuery(
    { contentType, contentId },
    { skip: !isOpen }
  );
  const [createAppeal, { isLoading: isSubmitting }] =
    useCreateAppealMutation();
  const { addToast } = useToast();

  const juryCase = data?.data ?? null;
  const canAppeal =
    juryCase !== null &&
    juryCase.status === 'resolved' &&
    juryCase.verdict === 'uphold_removal';

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!juryCase || !reason.trim()) return;

    try {
      await createAppeal({
        caseId: juryCase.id,
        reason: reason.trim(),
      }).unwrap();
      addToast('Appeal submitted.', 'success');
      handleClose();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your appeal. Please try again.';
      addToast(message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Appeal removal">
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isLoading && !juryCase && (
          <p className="text-sm text-text-muted">
            Could not find a jury case for this content.
          </p>
        )}

        {!isLoading && juryCase && !canAppeal && (
          <p className="text-sm text-text-muted">
            This case ({juryCase.status}
            {juryCase.verdict
              ? `, ${juryCase.verdict.replace('_', ' ')}`
              : ''}
            ) isn't eligible for an appeal.
          </p>
        )}

        {!isLoading && canAppeal && (
          <>
            <p className="text-sm text-text-secondary">
              This was removed by the community jury. Explain why you think
              the decision should be reconsidered — a senior jury panel will
              review it.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why should this decision be reconsidered?"
              rows={4}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!reason.trim()}
              >
                Submit appeal
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AppealModal;
