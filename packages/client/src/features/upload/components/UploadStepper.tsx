import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import {
  UploadSteps,
  type WizardStep,
} from '../UploadSteps';

interface UploadStepperProps {
  current: WizardStep;
}

const UploadStepper = ({ current }: UploadStepperProps) => {
  const currentIndex = UploadSteps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center w-full max-w-md mx-auto mb-10">
      {UploadSteps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-colors',
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

            {i < UploadSteps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 rounded-full bg-border overflow-hidden -mt-5">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: i < currentIndex ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UploadStepper;
