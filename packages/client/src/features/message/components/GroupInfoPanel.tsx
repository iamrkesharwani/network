import { useState } from 'react';
import { Camera, LogOut, UserPlus, Ban, Flag } from 'lucide-react';
import {
  GROUP_NAME_MAX_LENGTH,
  type IGroupConversationSummary,
  type IParticipantSummary,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import Button from '../../../shared/ui/primitives/Button';
import Avatar from '../../../shared/ui/primitives/Avatar';
import GroupAvatarPickerModal from './GroupAvatarPickerModal';
import SafetyNumberBadge from './SafetyNumberBadge';
import VerifyContactModal from './VerifyContactModal';
import ReportModal from '../../report/components/ReportModal';
import { useUpdateGroupMutation, useLeaveGroupMutation } from '../conversationApi';
import { useGetPublicKeysQuery } from '../keyBundleApi';
import { useBlockUserMutation } from '../../block/blockApi';

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
  const [groupName, setGroupName] = useState(conversation.groupName);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState<IParticipantSummary | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<IParticipantSummary | null>(
    null
  );
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [updateGroup, { isLoading: isRenaming }] = useUpdateGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();

  const participantIds = conversation.participants.map(
    (participant) => participant.id
  );
  const { data: publicKeysData } = useGetPublicKeysQuery(participantIds, {
    skip: !isOpen || participantIds.length === 0,
  });
  const myPublicKey = publicKeysData?.data.find(
    (key) => key.userId === myUserId
  )?.publicKey;
  const publicKeyFor = (userId: string): string | undefined =>
    publicKeysData?.data.find((key) => key.userId === userId)?.publicKey;

  const handleRename = async () => {
    const trimmed = groupName.trim();
    if (!trimmed || trimmed === conversation.groupName) return;
    await updateGroup({ conversationId: conversation.id, groupName: trimmed }).unwrap();
  };

  const handleLeave = async () => {
    await leaveGroup(conversation.id).unwrap();
    setIsLeaveConfirmOpen(false);
    onClose();
    onLeft();
  };

  const handleBlock = async () => {
    if (!blockTarget) return;
    await blockUser(blockTarget.username).unwrap();
    setBlockTarget(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Group info">
        <div className="mb-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsAvatarPickerOpen(true)}
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
              <div
                key={participant.id}
                className="group flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <Avatar
                  src={participant.avatarUrl}
                  fallback={participant.name}
                  isOnline={participant.isOnline}
                  size="sm"
                />
                <span className="flex-1 text-sm text-text-primary">
                  {participant.name}
                  {participant.id === myUserId && (
                    <span className="ml-1 text-xs text-text-muted">(you)</span>
                  )}
                </span>
                {participant.id !== myUserId && (
                  <SafetyNumberBadge
                    myUserId={myUserId}
                    myPublicKey={myPublicKey}
                    contactUserId={participant.id}
                    contactPublicKey={publicKeyFor(participant.id)}
                    onClick={() => setVerifyTarget(participant)}
                  />
                )}
                {participant.id !== myUserId && (
                  <button
                    type="button"
                    onClick={() => setBlockTarget(participant)}
                    aria-label={`Block ${participant.name}`}
                    className="shrink-0 rounded-lg p-1 text-icon opacity-0 transition-opacity hover:bg-error-subtle hover:text-error group-hover:opacity-100"
                  >
                    <Ban className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsReportOpen(true)}
          >
            <Flag className="mr-1.5 h-4 w-4" /> Report group
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setIsLeaveConfirmOpen(true)}
          >
            <LogOut className="mr-1.5 h-4 w-4" /> Leave group
          </Button>
        </div>
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

      <GroupAvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        conversationId={conversation.id}
      />

      <ConfirmModal
        isOpen={blockTarget !== null}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleBlock}
        title={`Block ${blockTarget?.name ?? 'this person'}?`}
        description="They won't be able to message you or see your content, and you won't see theirs. This doesn't remove them from the group. You can unblock them later from your Privacy settings."
        confirmLabel="Block"
        isLoading={isBlocking}
      />

      {verifyTarget && (
        <VerifyContactModal
          isOpen={verifyTarget !== null}
          onClose={() => setVerifyTarget(null)}
          myUserId={myUserId}
          contactUserId={verifyTarget.id}
          contactName={verifyTarget.name}
        />
      )}

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        contentType="conversation"
        contentId={conversation.id}
        authorId=""
        isOwnContent={conversation.isOwnedByViewer}
      />
    </>
  );
};

export default GroupInfoPanel;
