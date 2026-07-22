import { useRef, useState } from 'react';
import { Camera, LogOut, UserPlus } from 'lucide-react';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  GROUP_NAME_MAX_LENGTH,
  type IGroupConversationSummary,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import Button from '../../../shared/ui/primitives/Button';
import Avatar from '../../../shared/ui/primitives/Avatar';
import {
  useUpdateGroupMutation,
  useUploadGroupAvatarMutation,
  useLeaveGroupMutation,
} from '../conversationApi';

interface GroupInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: IGroupConversationSummary;
  myUserId: string;
  onLeft: () => void;
  onAddParticipants: () => void;
}

const GroupInfoPanel = ({
  isOpen,
  onClose,
  conversation,
  myUserId,
  onLeft,
  onAddParticipants,
}: GroupInfoPanelProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState(conversation.groupName);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [updateGroup, { isLoading: isRenaming }] = useUpdateGroupMutation();
  const [uploadGroupAvatar, { isLoading: isUploadingPhoto }] =
    useUploadGroupAvatarMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const handleRename = async () => {
    const trimmed = groupName.trim();
    if (!trimmed || trimmed === conversation.groupName) return;
    await updateGroup({ conversationId: conversation.id, groupName: trimmed }).unwrap();
  };

  const handlePhotoChange = async (file: File) => {
    setPhotoError(null);

    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
      )
    ) {
      setPhotoError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setPhotoError('Image is too large. Max size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await uploadGroupAvatar({ conversationId: conversation.id, formData }).unwrap();
    } catch {
      setPhotoError("Couldn't upload that image. Please try again.");
    }
  };

  const handleLeave = async () => {
    await leaveGroup(conversation.id).unwrap();
    setIsLeaveConfirmOpen(false);
    onClose();
    onLeft();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Group info">
        <div className="mb-6 flex flex-col items-center">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_AVATAR_MIME_TYPES.join(',')}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handlePhotoChange(file);
            }}
          />
          <button
            type="button"
            onClick={() => !isUploadingPhoto && inputRef.current?.click()}
            className="group relative h-20 w-20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
            aria-label="Change group photo"
          >
            <Avatar
              src={conversation.groupAvatarUrl}
              fallback={conversation.groupName}
              className="h-20 w-20 text-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
          </button>
          {photoError && (
            <p role="alert" className="mt-2 text-[0.72rem] text-error">
              {photoError}
            </p>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          <input
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            onBlur={handleRename}
            maxLength={GROUP_NAME_MAX_LENGTH}
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {isRenaming && (
            <span className="self-center text-xs text-text-muted">Saving…</span>
          )}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              {conversation.participants.length} members
            </h3>
            <Button size="sm" variant="outline" onClick={onAddParticipants}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add
            </Button>
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto">
            {conversation.participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <Avatar
                  src={participant.avatarUrl}
                  fallback={participant.name}
                  isOnline={participant.isOnline}
                  size="sm"
                />
                <span className="text-sm text-text-primary">
                  {participant.name}
                  {participant.id === myUserId && (
                    <span className="ml-1 text-xs text-text-muted">(you)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="danger"
          className="w-full"
          onClick={() => setIsLeaveConfirmOpen(true)}
        >
          <LogOut className="mr-1.5 h-4 w-4" /> Leave group
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        onConfirm={handleLeave}
        title="Leave this group?"
        description="You'll stop receiving messages from this group. You can be re-added later by any member."
        confirmLabel="Leave group"
        isLoading={isLeaving}
      />
    </>
  );
};

export default GroupInfoPanel;
