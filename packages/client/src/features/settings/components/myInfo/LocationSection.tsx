import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAppSelector } from '../../../../shared/hooks/useAppSelector';
import { useCaptureLocationMutation } from '../../settingsApi';
import Button from '../../../../shared/ui/primitives/Button';
import Modal from '../../../../shared/ui/overlay/Modal';

const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
    });
  });

const LocationSection = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [captureLocation, { isLoading }] = useCaptureLocationMutation();
  const [showGuide, setShowGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleAddLocation = async () => {
    setError(null);

    if (!navigator.geolocation) {
      setError('Your browser does not support location access.');
      return;
    }

    try {
      const position = await getCurrentPosition();
      await captureLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }).unwrap();
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as GeolocationPositionError).code ===
          GeolocationPositionError.PERMISSION_DENIED
      ) {
        setShowGuide(true);
      } else {
        setError("Couldn't get your location. Please try again.");
      }
    }
  };

  const entries = [...(user.location ?? [])].reverse();
  const latest = entries[0];

  return (
    <div className="mb-6">
      <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        Location
      </p>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5">
        <span className="flex items-center gap-2 text-sm text-text-primary">
          <MapPin className="h-4 w-4 shrink-0 text-text-muted" />
          {latest ? (
            <span>
              {latest.lat.toFixed(3)}, {latest.lng.toFixed(3)}
              <span className="ml-1.5 text-xs text-text-muted">
                ({format(new Date(latest.capturedAt), 'MMM d, yyyy')})
              </span>
            </span>
          ) : (
            <span className="text-text-muted">Not added</span>
          )}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          isLoading={isLoading}
          onClick={handleAddLocation}
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-[0.72rem] text-error">
          {error}
        </p>
      )}

      <Modal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title="Location access is blocked"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-secondary"
        >
          <p className="mb-3">
            Your browser is blocking location access for this site. To add
            your location:
          </p>
          <ol className="mb-4 list-decimal space-y-1.5 pl-5">
            <li>Click the lock/site-info icon in your browser's address bar</li>
            <li>Find "Location" in the site permissions</li>
            <li>Set it to "Allow"</li>
            <li>Reload this page and try again</li>
          </ol>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowGuide(false)}
          >
            Got it
          </Button>
        </motion.div>
      </Modal>
    </div>
  );
};

export default LocationSection;
