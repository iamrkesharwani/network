import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
  GROUP_AVATAR_ASPECT_RATIO,
  GROUP_AVATAR_WIDTH_PX,
  GROUP_AVATAR_HEIGHT_PX,
} from '@network/shared';
import Modal from '../../../shared/ui/overlay/Modal';
import Button from '../../../shared/ui/primitives/Button';
import { cropImage } from '../../../shared/utils/cropImage';
import { getApiErrorMessage } from '../../../shared/lib/getApiErrorMessage';
import { useUploadGroupAvatarMutation } from '../conversationApi';

interface GroupAvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

const GroupAvatarPickerModal = ({
  isOpen,
  onClose,
  conversationId,
}: GroupAvatarPickerModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickedImage, setPickedImage] = useState<{
    src: string;
    mimeType: string;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadGroupAvatar, { isLoading: isUploading }] =
    useUploadGroupAvatarMutation();

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
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
      )
    ) {
      setError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Image is too large. Max size is 5MB.');
      return;
    }

    setPickedImage({ src: URL.createObjectURL(file), mimeType: file.type });
  };

  const handleConfirmCrop = async () => {
    if (!pickedImage || !croppedAreaPixels) return;

    setError(null);
    try {
      const blob = await cropImage(
        pickedImage.src,
        croppedAreaPixels,
        GROUP_AVATAR_WIDTH_PX,
        GROUP_AVATAR_HEIGHT_PX,
        pickedImage.mimeType
      );

      const formData = new FormData();
      formData.append('avatar', blob, `avatar.${pickedImage.mimeType.split('/')[1]}`);

      await uploadGroupAvatar({ conversationId, formData }).unwrap();
      handleClose();
    } catch (uploadError) {
      setError(
        getApiErrorMessage(uploadError, "Couldn't upload that image. Please try again.")
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={pickedImage ? 'Crop group photo' : 'Choose a group photo'}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_AVATAR_MIME_TYPES.join(',')}
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
              aspect={GROUP_AVATAR_ASPECT_RATIO}
              cropShape="round"
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
          {error && (
            <p role="alert" className="mb-2 text-[0.72rem] text-error">
              {error}
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
            Choose an image
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default GroupAvatarPickerModal;
