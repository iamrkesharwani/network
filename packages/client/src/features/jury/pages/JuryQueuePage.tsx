import { Link, useNavigate } from 'react-router-dom';
import { Gavel, ScrollText } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import Spinner from '../../../shared/ui/primitives/Spinner';
import Button from '../../../shared/ui/primitives/Button';
import { useGetAssignedCasesQuery } from '../juryApi';

const JuryQueuePage = () => {
  usePageTitle('Jury Duty');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetAssignedCasesQuery();
  const cases = data?.data ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 pt-3">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold text-text-primary">Jury</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Vote once you've reviewed the content in question.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => navigate(CLIENT_ROUTES.JURY_APPEALS)}
        >
          <ScrollText className="h-4 w-4" strokeWidth={1.75} />
          My appeals
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-subtle">
            <Gavel className="h-6 w-6 text-error" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              Could not load your cases
            </p>
            <p className="text-xs text-text-muted">
              Something went wrong on our end.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && cases.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised">
            <Gavel className="h-6 w-6 text-text-muted" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              No cases assigned
            </p>
            <p className="max-w-72 text-xs text-text-muted">
              You'll see cases here once you're picked for jury duty on a
              report.
            </p>
          </div>
        </div>
      )}

      {cases.length > 0 && (
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
      )}
    </div>
  );
};

export default JuryQueuePage;
