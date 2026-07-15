import { useState } from 'react';
import {
  REPORTABLE_CONTENT_TYPES,
  type ReportableContentType,
} from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import Button from '../../../shared/ui/primitives/Button';
import { useToast } from '../../../shared/hooks/useToast';
import {
  useGetMyAppealsQuery,
  useCreateAppealMutation,
  useLazyGetCaseForContentQuery,
} from '../juryApi';

const CONTENT_TYPE_LABELS: Record<ReportableContentType, string> = {
  video: 'Video',
  short: 'Short',
  post: 'Post',
  comment: 'Comment',
};

const APPEALABLE_CONTENT_TYPES = REPORTABLE_CONTENT_TYPES.filter(
  (type) => type !== 'comment'
);

const AppealsPage = () => {
  usePageTitle('Appeals');
  const { data, isLoading } = useGetMyAppealsQuery({ limit: 20 });
  const appeals = data?.data ?? [];

  const [contentType, setContentType] =
    useState<ReportableContentType>('video');
  const [contentId, setContentId] = useState('');
  const [reason, setReason] = useState('');
  const [lookupCase, { data: caseData, isFetching: isLookingUp }] =
    useLazyGetCaseForContentQuery();
  const [createAppeal, { isLoading: isSubmitting }] =
    useCreateAppealMutation();
  const { addToast } = useToast();

  const foundCase = caseData?.data ?? null;
  const canAppeal =
    foundCase !== null &&
    foundCase.status === 'resolved' &&
    foundCase.verdict === 'uphold_removal';

  const handleLookup = async () => {
    if (!contentId.trim()) return;
    try {
      await lookupCase({ contentType, contentId: contentId.trim() }).unwrap();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not find that content, or you do not own it.';
      addToast(message, 'error');
    }
  };

  const handleSubmitAppeal = async () => {
    if (!foundCase || !reason.trim()) return;
    try {
      await createAppeal({ caseId: foundCase.id, reason: reason.trim() }).unwrap();
      addToast('Appeal submitted.', 'success');
      setContentId('');
      setReason('');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not submit your appeal. Please try again.';
      addToast(message, 'error');
    }
  };

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Appeals</h1>
        <p className="text-sm text-text-secondary">
          If the jury removed your content, you can appeal the decision for a
          senior-jury review here.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold text-text-primary">
          File a new appeal
        </h2>

        <div className="flex gap-2">
          <select
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as ReportableContentType)
            }
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          >
            {APPEALABLE_CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {CONTENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <input
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            placeholder="Content ID"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLookup}
            isLoading={isLookingUp}
          >
            Look up
          </Button>
        </div>

        {caseData && !foundCase && (
          <p className="text-sm text-text-muted">
            No removal case found for that content.
          </p>
        )}

        {foundCase && !canAppeal && (
          <p className="text-sm text-text-muted">
            This case ({foundCase.status}
            {foundCase.verdict
              ? `, ${foundCase.verdict.replace('_', ' ')}`
              : ''}
            ) isn't eligible for an appeal.
          </p>
        )}

        {canAppeal && (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why should this decision be reconsidered?"
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
            <Button
              onClick={handleSubmitAppeal}
              isLoading={isSubmitting}
              disabled={!reason.trim()}
              className="self-end"
            >
              Submit appeal
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text-primary">
          My appeals
        </h2>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isLoading && appeals.length === 0 && (
          <p className="text-sm text-text-muted">
            You haven't filed any appeals.
          </p>
        )}

        {appeals.map((appeal) => (
          <div
            key={appeal.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <span className="text-sm text-text-primary">
              {appeal.reason}
            </span>
            <span className="text-xs font-medium capitalize text-text-muted">
              {appeal.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppealsPage;
