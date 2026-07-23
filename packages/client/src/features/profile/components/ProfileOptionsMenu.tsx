import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Ban } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import { useBlockUserMutation } from '../../block/blockApi';

interface ProfileOptionsMenuProps {
  username: string;
  name: string;
}

const ProfileOptionsMenu = ({ username, name }: ProfileOptionsMenuProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [blockUser, { isLoading }] = useBlockUserMutation();

  const handleBlock = async () => {
    await blockUser(username).unwrap();
    setIsConfirmOpen(false);
    navigate(CLIENT_ROUTES.FEED, { replace: true });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label="Profile options"
        aria-expanded={isMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-icon transition-colors hover:bg-surface-raised hover:text-icon-hover"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-surface-overlay py-1 shadow-xl shadow-black/40">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-error transition-colors hover:bg-error-subtle"
            >
              <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Block
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleBlock}
        title={`Block ${name}?`}
        description="They won't be able to message you or see your content, and you won't see theirs. You can unblock them later from your Privacy settings."
        confirmLabel="Block"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfileOptionsMenu;
