import { useEffect, useState } from 'react';
import { Globe, EyeOff } from 'lucide-react';
import {
  CONTENT_VISIBILITY,
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_DESCRIPTION_MAX_LENGTH,
  type ContentVisibility,
  type IPlaylistDetail,
  type IPlaylistSummary,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import Select, { type SelectOption } from '../../../shared/ui/primitives/Select';
import {
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
} from '../playlistApi';

const VISIBILITY_OPTIONS: SelectOption<ContentVisibility>[] = CONTENT_VISIBILITY.map(
  (value) => ({
    value,
    label: value === 'public' ? 'Public' : 'Unlisted',
    icon: value === 'public' ? Globe : EyeOff,
  })
);

export interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist?: IPlaylistDetail;
  onCreated?: (playlist: IPlaylistSummary) => void;
  onUpdated?: (playlist: IPlaylistSummary) => void;
}

const CreatePlaylistModal = ({
  isOpen,
  onClose,
  playlist,
  onCreated,
  onUpdated,
}: CreatePlaylistModalProps) => {
  const isEditMode = playlist !== undefined;

  const [title, setTitle] = useState(playlist?.title ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');
  const [visibility, setVisibility] = useState<ContentVisibility>(
    playlist?.visibility ?? 'public'
  );
  const [error, setError] = useState<string | null>(null);

  const [createPlaylist, { isLoading: isCreating }] =
    useCreatePlaylistMutation();
  const [updatePlaylist, { isLoading: isUpdating }] =
    useUpdatePlaylistMutation();

  useEffect(() => {
    if (!isOpen) return;
    setTitle(playlist?.title ?? '');
    setDescription(playlist?.description ?? '');
    setVisibility(playlist?.visibility ?? 'public');
    setError(null);
  }, [isOpen, playlist]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      if (isEditMode) {
        const result = await updatePlaylist({
          playlistId: playlist.id,
          data: {
            title: title.trim(),
            description: description.trim(),
            visibility,
          },
        }).unwrap();
        onUpdated?.(result.data);
      } else {
        const result = await createPlaylist({
          title: title.trim(),
          ...(description.trim() && { description: description.trim() }),
          visibility,
        }).unwrap();
        onCreated?.(result.data);
      }
      handleClose();
    } catch {
      setError(
        isEditMode
          ? 'Failed to update playlist. Please try again.'
          : 'Failed to create playlist. Please try again.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit playlist' : 'Create playlist'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="playlist-title"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Title
          </label>
          <input
            id="playlist-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={PLAYLIST_TITLE_MAX_LENGTH}
            placeholder="My playlist"
            className="w-full rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="playlist-description"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            Description (optional)
          </label>
          <textarea
            id="playlist-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={PLAYLIST_DESCRIPTION_MAX_LENGTH}
            rows={3}
            placeholder="What's this playlist about?"
            className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Select
          label="Visibility"
          value={visibility}
          onChange={setVisibility}
          options={VISIBILITY_OPTIONS}
        />

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isEditMode ? isUpdating : isCreating}>
            {isEditMode ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePlaylistModal;
