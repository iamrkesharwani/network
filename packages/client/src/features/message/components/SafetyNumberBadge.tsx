import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { computeSafetyNumber } from '../keyManager';
import {
  getContactVerificationStatus,
  type ContactVerificationStatus,
} from '../safetyNumberStore';

interface SafetyNumberBadgeProps {
  myUserId: string;
  myPublicKey?: string;
  contactUserId: string;
  contactPublicKey?: string;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  ContactVerificationStatus,
  { icon: typeof Shield; className: string; label: string }
> = {
  unverified: { icon: Shield, className: 'text-icon', label: 'Not verified' },
  verified: {
    icon: ShieldCheck,
    className: 'text-success',
    label: 'Verified',
  },
  'key-changed': {
    icon: ShieldAlert,
    className: 'text-error',
    label: 'Key changed — re-verify',
  },
};

const SafetyNumberBadge = ({
  myUserId,
  myPublicKey,
  contactUserId,
  contactPublicKey,
  onClick,
}: SafetyNumberBadgeProps) => {
  const [status, setStatus] = useState<ContactVerificationStatus | null>(null);

  useEffect(() => {
    if (!myPublicKey || !contactPublicKey) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    computeSafetyNumber(
      myUserId,
      myPublicKey,
      contactUserId,
      contactPublicKey
    ).then((fingerprint) => {
      if (!cancelled) {
        setStatus(
          getContactVerificationStatus(myUserId, contactUserId, fingerprint)
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [myUserId, myPublicKey, contactUserId, contactPublicKey]);

  if (!status) return null;

  const { icon: Icon, className, label } = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'shrink-0 rounded-lg p-1.5 hover:bg-surface-raised',
        className
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
};

export default SafetyNumberBadge;
