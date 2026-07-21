import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  ALLOWED_BANNER_MIME_TYPES,
  MAX_BANNER_SIZE_BYTES,
  BANNER_ASPECT_RATIO,
  BANNER_WIDTH_PX,
  BANNER_HEIGHT_PX,
  BANNER_PRESET_CATALOG,
} from '@network/shared';
import Modal from '../../../../shared/ui/overlay/Modal';
import Button from '../../../../shared/ui/primitives/Button';
import { cropImage } from '../../../../shared/utils/cropImage';
import {
  useUploadBannerMutation,
  useSelectBannerPresetMutation,
} from '../../settingsApi';

export interface BannerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BannerPickerModal = ({ isOpen, onClose }: BannerPickerModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickedImage, setPickedImage] = useState<{
    src: string;
    mimeType: string;
  } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadBanner, { isLoading: isUploading }] = useUploadBannerMutation();
  const [selectBannerPreset, { isLoading: isSelectingPreset }] =
    useSelectBannerPresetMutation();

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
      !ALLOWED_BANNER_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_BANNER_MIME_TYPES)[number]
      )
    ) {
      setError('Please use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_BANNER_SIZE_BYTES) {
      setError('Image is too large. Max size is 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (
        probe.naturalWidth < BANNER_WIDTH_PX ||
        probe.naturalHeight < BANNER_HEIGHT_PX
      ) {
        setError(
          `Image is too small. Use at least ${BANNER_WIDTH_PX}x${BANNER_HEIGHT_PX}px.`
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

  const handlePreset = async (presetId: string) => {
    setError(null);
    try {
      await selectBannerPreset({ presetId }).unwrap();
      handleClose();
    } catch {
      setError("Couldn't set that banner. Please try again.");
    }
  };

  const handleConfirmCrop = async () => {
    if (!pickedImage || !croppedAreaPixels) return;

    setError(null);
    try {
      const blob = await cropImage(
        pickedImage.src,
        croppedAreaPixels,
        BANNER_WIDTH_PX,
        BANNER_HEIGHT_PX,
        pickedImage.mimeType
      );

      const formData = new FormData();
      formData.append('banner', blob, `banner.${pickedImage.mimeType.split('/')[1]}`);

      await uploadBanner(formData).unwrap();
      handleClose();
    } catch {
      setError("Couldn't upload that image. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={pickedImage ? 'Crop banner' : 'Choose a banner'}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_BANNER_MIME_TYPES.join(',')}
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
              aspect={BANNER_ASPECT_RATIO}
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
          {BANNER_PRESET_CATALOG.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BANNER_PRESET_CATALOG.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isSelectingPreset}
                  onClick={() => handlePreset(preset.id)}
                  className="aspect-[3/1] overflow-hidden rounded-lg border border-border transition-colors hover:border-primary disabled:opacity-50"
                >
                  <img
                    src={preset.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              No preset banners are available yet.
            </p>
          )}

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
            Upload your own
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default BannerPickerModal;
