import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  ALLOWED_PLAYLIST_COVER_MIME_TYPES,
  MAX_PLAYLIST_COVER_SIZE_BYTES,
  PLAYLIST_COVER_ASPECT_RATIO,
  PLAYLIST_COVER_WIDTH_PX,
  PLAYLIST_COVER_HEIGHT_PX,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { cropImage } from '../../../shared/utils/cropImage';
import { useUploadPlaylistCoverMutation } from '../playlistApi';

export interface PlaylistCoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
}

const PlaylistCoverPickerModal = ({
  isOpen,
  onClose,
  playlistId,
}: PlaylistCoverPickerModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickedImage, setPickedImage] = useState<{
    src: string;
    mimeType: string;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadCover, { isLoading: isUploading }] =
    useUploadPlaylistCoverMutation();

  useEffect(() => {
    return () => {
      if (pickedImage) URL.revokeObjectURL(pickedImage.src);
    };
  }, [pickedImage]);

  const reset = () => {
    setPickedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    setError(null);

    if (
      !ALLOWED_PLAYLIST_COVER_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_PLAYLIST_COVER_MIME_TYPES)[number]
      )
    ) {
      setError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_PLAYLIST_COVER_SIZE_BYTES) {
      setError('Image is too large. Max size is 2MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (
        probe.naturalWidth < PLAYLIST_COVER_WIDTH_PX ||
        probe.naturalHeight < PLAYLIST_COVER_HEIGHT_PX
      ) {
        setError(
          `Image is too small. Use at least ${PLAYLIST_COVER_WIDTH_PX}x${PLAYLIST_COVER_HEIGHT_PX}px.`
        );
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setPickedImage({ src: objectUrl, mimeType: file.type });
    };
    probe.onerror = () => {
      setError("Couldn't read that image. Please try another file.");
      URL.revokeObjectURL(objectUrl);
    };
    probe.src = objectUrl;
  };

  const handleConfirmCrop = async () => {
    if (!pickedImage || !croppedAreaPixels) return;

    setError(null);
    try {
      const blob = await cropImage(
        pickedImage.src,
        croppedAreaPixels,
        PLAYLIST_COVER_WIDTH_PX,
        PLAYLIST_COVER_HEIGHT_PX,
        pickedImage.mimeType
      );

      const formData = new FormData();
      formData.append('cover', blob, `cover.${pickedImage.mimeType.split('/')[1]}`);

      await uploadCover({ playlistId, data: formData }).unwrap();
      handleClose();
    } catch {
      setError("Couldn't upload that image. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={pickedImage ? 'Crop cover' : 'Choose a cover image'}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_PLAYLIST_COVER_MIME_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {pickedImage ? (
        <div>
          <div className="relative h-64 w-full overflow-hidden rounded-lg bg-surface-raised">
            <Cropper
              image={pickedImage.src}
              crop={crop}
              zoom={zoom}
              aspect={PLAYLIST_COVER_ASPECT_RATIO}
              cropShape="rect"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
          </div>

          {error && (
            <p role="alert" className="mt-2 text-[0.72rem] text-error">
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={reset}>
              Back
            </Button>
            <Button size="sm" isLoading={isUploading} onClick={handleConfirmCrop}>
              Use this photo
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-text-muted">
            Choose an image for your playlist cover. It defaults to your first
            video's thumbnail until you set one.
          </p>

          {error && (
            <p role="alert" className="mt-2 text-[0.72rem] text-error">
              {error}
            </p>
          )}

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => inputRef.current?.click()}
          >
            Upload an image
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default PlaylistCoverPickerModal;
