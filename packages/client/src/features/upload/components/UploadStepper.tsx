import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface UploadStepperProps<TStep extends string> {
  current: TStep;
  steps: { key: TStep; label: string }[];
  isUploadStarted?: boolean;
}

function UploadStepper<TStep extends string>({
  current,
  steps,
  isUploadStarted = false,
}: UploadStepperProps<TStep>) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  const stepCount = steps.length;
  const forceFirstComplete = isUploadStarted && currentIndex === 0;
  const filledSegments = Math.max(currentIndex, forceFirstComplete ? 1 : 0);
  const fillPercent =
    stepCount > 1 ? (filledSegments / (stepCount - 1)) * 100 : 0;
  const edgeInset = stepCount > 0 ? 50 / stepCount : 0;

  return (
    <div className="relative mx-auto mb-10 w-full max-w-md">
      <div
        className="absolute top-4 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-border"
        style={{ left: `${edgeInset}%`, right: `${edgeInset}%` }}
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
      >
        {steps.map((step, i) => {
          const stepForceComplete = forceFirstComplete && i === 0;
          const isComplete = i < currentIndex || stepForceComplete;
          const isCurrent = i === currentIndex && !stepForceComplete;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 bg-surface text-xs font-semibold transition-colors',
                  isComplete && 'bg-primary border-primary text-white',
                  isCurrent && 'border-primary text-primary bg-primary-muted',
                  !isComplete && !isCurrent && 'border-border text-text-muted'
                )}
              >
                {isComplete ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>

              <span
                className={cn(
                  'text-[0.65rem] font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary' : 'text-text-muted'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UploadStepper;
