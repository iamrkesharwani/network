import Modal from '../../../shared/ui/overlay/Modal';

export interface PushPermissionGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PushPermissionGuidanceModal = ({
  isOpen,
  onClose,
}: PushPermissionGuidanceModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Notifications are blocked">
    <div className="space-y-4 text-sm text-text-secondary">
      <p>
        Your browser is currently blocking notifications for this site. Since
        browsers don&apos;t let sites re-ask once you&apos;ve said no, you&apos;ll
        need to allow it from your browser&apos;s own settings instead:
      </p>

      <div className="space-y-3">
        <div>
          <p className="font-medium text-text-primary">Chrome / Edge / Brave</p>
          <p>
            Click the lock (or info) icon left of the address bar → Site
            settings → set <span className="font-medium">Notifications</span>{' '}
            to Allow → reload the page.
          </p>
        </div>

        <div>
          <p className="font-medium text-text-primary">Firefox</p>
          <p>
            Click the lock icon left of the address bar → Permissions →
            remove the block on <span className="font-medium">Send Notifications</span>{' '}
            → reload the page.
          </p>
        </div>

        <div>
          <p className="font-medium text-text-primary">Safari</p>
          <p>
            Safari menu → Settings for This Website → set{' '}
            <span className="font-medium">Notifications</span> to Allow.
          </p>
        </div>
      </div>

      <p className="text-text-muted">
        Once allowed, come back and toggle push notifications on again.
      </p>
    </div>
  </Modal>
);

export default PushPermissionGuidanceModal;
