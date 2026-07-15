import { Link } from 'react-router-dom';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import { useGetAssignedCasesQuery } from '../juryApi';

const JuryQueuePage = () => {
  usePageTitle('Jury Duty');
  const { data, isLoading, isError } = useGetAssignedCasesQuery();
  const cases = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Jury duty
          </h1>
          <p className="text-sm text-text-secondary">
            Cases assigned to you for review. Vote once you've reviewed the
            content in question.
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.JURY_APPEALS}
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          My appeals
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-sm text-error">
          Could not load your assigned cases.
        </p>
      )}

      {!isLoading && !isError && cases.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-lg font-medium text-text-primary">
            No cases assigned
          </p>
          <p className="text-sm text-text-muted">
            You'll see cases here once you're picked for jury duty on a
            report.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {cases.map((juryCase) => (
          <Link
            key={juryCase.id}
            to={CLIENT_ROUTES.JURY_CASE.replace(':caseId', juryCase.id)}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-surface-raised transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium capitalize text-text-primary">
                {juryCase.contentType} report
              </span>
              <span className="text-xs text-text-muted">
                {juryCase.votesCast}/{juryCase.poolSize} votes cast
              </span>
            </div>
            {juryCase.myVote && (
              <span className="text-xs font-medium capitalize text-primary">
                You voted: {juryCase.myVote.replace('_', ' ')}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JuryQueuePage;
