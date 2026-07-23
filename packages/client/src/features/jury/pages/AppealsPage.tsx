import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import Button from '../../../shared/ui/primitives/Button';
import ContentTypePicker from '../components/ContentTypePicker';
import {
  useGetMyAppealsQuery,
  useCreateAppealMutation,
  useLazyGetCaseForContentQuery,
} from '../juryApi';
import {
  CLIENT_ROUTES,
  REPORTABLE_CONTENT_TYPES,
  type ReportableContentType,
} from '@network/shared';

const CONTENT_TYPE_LABELS: Record<ReportableContentType, string> = {
  video: 'Video',
  short: 'Short',
  post: 'Post',
  comment: 'Comment',
  message: 'Message',
  conversation: 'Conversation',
};

const APPEALABLE_CONTENT_TYPES = REPORTABLE_CONTENT_TYPES.filter(
  (type) => type !== 'comment'
);

const AppealsPage = () => {
  usePageTitle('Jury Appeals');
  const { data, isLoading } = useGetMyAppealsQuery({ limit: 20 });
  const appeals = data?.data ?? [];

  const [contentType, setContentType] =
    useState<ReportableContentType>('video');
  const [contentId, setContentId] = useState('');
  const [reason, setReason] = useState('');
  const [lookupCase, { data: caseData, isFetching: isLookingUp }] =
    useLazyGetCaseForContentQuery();
  const [createAppeal, { isLoading: isSubmitting }] = useCreateAppealMutation();
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
      await createAppeal({
        caseId: foundCase.id,
        reason: reason.trim(),
      }).unwrap();
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
    <div>
      <Link
        to={CLIENT_ROUTES.JURY_QUEUE}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jury
      </Link>

      <div className="mx-auto flex max-w-xl flex-col gap-8 pt-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold text-text-primary">Appeals</h1>
          <p className="max-w-sm text-sm text-text-secondary">
            Appeal the decision for a senior-jury review here.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
          <h2 className="text-center text-sm font-semibold text-text-primary">
            File a new appeal
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <div className="flex gap-2">
              <ContentTypePicker
                value={contentType}
                onChange={setContentType}
                options={APPEALABLE_CONTENT_TYPES}
                labels={CONTENT_TYPE_LABELS}
              />
              <input
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Content ID"
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary sm:w-56 sm:flex-none"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLookup}
              isLoading={isLookingUp}
              className="w-full shrink-0 sm:w-auto"
            >
              Look up
            </Button>
          </div>

          {caseData && !foundCase && (
            <p className="text-center text-sm text-text-muted">
              No removal case found for that content.
            </p>
          )}

          {foundCase && !canAppeal && (
            <p className="text-center text-sm text-text-muted">
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
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
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

        <div className="flex flex-col gap-3">
          {appeals.length > 0 && (
            <h2 className="text-center text-sm font-semibold text-text-primary">
              My appeals
            </h2>
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}

          {!isLoading && appeals.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
                <ScrollText
                  className="h-6 w-6 text-text-muted"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-text-primary">
                  No appeals yet
                </p>
                <p className="max-w-72 text-xs text-text-muted">
                  If the jury removes something you own, you can appeal the
                  decision here.
                </p>
              </div>
            </div>
          )}

          {appeals.map((appeal) => (
            <div
              key={appeal.id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span className="text-sm text-text-primary">{appeal.reason}</span>
              <span className="text-xs font-medium capitalize text-text-muted">
                {appeal.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppealsPage;
