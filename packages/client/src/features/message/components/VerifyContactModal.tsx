import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { computeSafetyNumber } from '../keyManager';
import {
  getContactVerificationStatus,
  markContactVerified,
  type ContactVerificationStatus,
} from '../safetyNumberStore';
import { useGetMyKeyBundleQuery, useGetPublicKeyQuery } from '../keyBundleApi';

interface VerifyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  myUserId: string;
  contactUserId: string;
  contactName: string;
}

const VerifyContactModal = ({
  isOpen,
  onClose,
  myUserId,
  contactUserId,
  contactName,
}: VerifyContactModalProps) => {
  const { data: myKeyBundle } = useGetMyKeyBundleQuery(undefined, {
    skip: !isOpen,
  });
  const { data: contactKey } = useGetPublicKeyQuery(contactUserId, {
    skip: !isOpen,
  });

  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [status, setStatus] = useState<ContactVerificationStatus | null>(null);

  useEffect(() => {
    const myPublicKey = myKeyBundle?.data.publicKey;
    const contactPublicKey = contactKey?.data.publicKey;
    if (!isOpen || !myPublicKey || !contactPublicKey) {
      setFingerprint(null);
      setStatus(null);
      return;
    }

    let cancelled = false;
    computeSafetyNumber(
      myUserId,
      myPublicKey,
      contactUserId,
      contactPublicKey
    ).then((value) => {
      if (cancelled) return;
      setFingerprint(value);
      setStatus(getContactVerificationStatus(myUserId, contactUserId, value));
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, myKeyBundle, contactKey, myUserId, contactUserId]);

  const handleMarkVerified = () => {
    if (!fingerprint) return;
    markContactVerified(myUserId, contactUserId, fingerprint);
    setStatus('verified');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Verify ${contactName}`}>
      <p className="mb-4 text-sm text-text-muted">
        Compare this code with {contactName} through another channel — in
        person, or a phone call — to confirm you're both talking to the real
        account, not an impersonator.
      </p>

      {fingerprint ? (
        <p className="mb-4 rounded-lg bg-surface-raised px-4 py-3 text-center font-mono text-lg tracking-widest text-text-primary">
          {fingerprint}
        </p>
      ) : (
        <p className="mb-4 text-sm text-text-muted">Loading…</p>
      )}

      {status === 'key-changed' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-error/40 bg-error-subtle px-3 py-2 text-sm text-error">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          This doesn't match what you previously verified — {contactName}'s
          key has changed.
        </div>
      )}

      {status === 'verified' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/40 px-3 py-2 text-sm text-success">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Verified
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleMarkVerified}
        disabled={!fingerprint || status === 'verified'}
      >
        Mark as verified
      </Button>
    </Modal>
  );
};

export default VerifyContactModal;
