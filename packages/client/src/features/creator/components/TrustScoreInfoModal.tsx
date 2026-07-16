import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  TRUST_POINTS,
  TRUST_SIGNAL_LABELS,
  TRUST_TIERS,
  TRUST_TIER_LABELS,
  TRUST_FEATURE_LABELS,
  type TrustSignalType,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';

export interface TrustScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const signalEntries = Object.entries(TRUST_POINTS) as Array<
  [TrustSignalType, number]
>;
const gains = signalEntries.filter(([, points]) => points > 0);
const losses = signalEntries.filter(([, points]) => points < 0);

const TrustScoreInfoModal = ({ isOpen, onClose }: TrustScoreInfoModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to increase trust score"
    >
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            Earn points
          </p>
          <ul className="space-y-1.5">
            {gains.map(([signal, points]) => (
              <li
                key={signal}
                className="flex items-center justify-between gap-3 text-sm text-text-primary"
              >
                <span>{TRUST_SIGNAL_LABELS[signal]}</span>
                <span className="shrink-0 font-medium text-success">
                  +{points}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {losses.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-error" />
              Avoid these
            </p>
            <ul className="space-y-1.5">
              {losses.map(([signal, points]) => (
                <li
                  key={signal}
                  className="flex items-center justify-between gap-3 text-sm text-text-primary"
                >
                  <span>{TRUST_SIGNAL_LABELS[signal]}</span>
                  <span className="shrink-0 font-medium text-error">
                    {points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">
            Tiers &amp; unlocks
          </p>
          <ul className="space-y-1.5">
            {TRUST_TIERS.map((tier) => (
              <li
                key={tier.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="font-medium text-text-primary">
                  {TRUST_TIER_LABELS[tier.id]}
                </span>
                <span className="text-xs text-text-muted text-right">
                  {tier.minScore}+ pts
                  {tier.unlocks.length > 0 &&
                    ` · ${tier.unlocks.map((f) => TRUST_FEATURE_LABELS[f]).join(', ')}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default TrustScoreInfoModal;
