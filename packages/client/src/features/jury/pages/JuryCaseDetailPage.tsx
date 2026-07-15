import { useParams } from 'react-router-dom';
import type { JuryVoteChoice } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import Button from '../../../shared/ui/primitives/Button';
import { useToast } from '../../../shared/hooks/useToast';
import { useGetCaseQuery, useCastVoteMutation } from '../juryApi';

const JuryCaseDetailPage = () => {
  const { caseId = '' } = useParams<{ caseId: string }>();
  usePageTitle('Jury case');
  const { data, isLoading, isError } = useGetCaseQuery(caseId, {
    skip: !caseId,
  });
  const [castVote, { isLoading: isVoting }] = useCastVoteMutation();
  const { addToast } = useToast();

  const juryCase = data?.data;

  const handleVote = async (vote: JuryVoteChoice) => {
    try {
      await castVote({ caseId, vote }).unwrap();
      addToast('Vote recorded.', 'success');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Could not record your vote. Please try again.';
      addToast(message, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !juryCase) {
    return (
      <p className="text-sm text-error">
        Could not load this case. You may not be assigned to it.
      </p>
    );
  }

  const hasVoted = juryCase.myVote !== undefined;
  const isDeciding = juryCase.status === 'deciding';

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold capitalize text-text-primary">
          {juryCase.contentType} case
        </h1>
        <p className="text-sm text-text-secondary">
          {juryCase.votesCast}/{juryCase.poolSize} votes cast · Status:{' '}
          {juryCase.status}
          {juryCase.verdict && ` · Verdict: ${juryCase.verdict.replace('_', ' ')}`}
        </p>
      </div>

      <p className="text-sm text-text-muted">
        Content ID: {juryCase.contentId}
      </p>

      {hasVoted ? (
        <p className="text-sm font-medium capitalize text-primary">
          You voted: {juryCase.myVote?.replace('_', ' ')}
        </p>
      ) : isDeciding ? (
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => handleVote('remove')}
            isLoading={isVoting}
          >
            Remove content
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleVote('no_action')}
            isLoading={isVoting}
          >
            No action
          </Button>
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          This case is no longer open for voting.
        </p>
      )}
    </div>
  );
};

export default JuryCaseDetailPage;
