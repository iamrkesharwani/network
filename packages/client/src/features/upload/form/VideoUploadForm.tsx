import {
  type IGamificationEvent,
  RING_SIZE,
  RING_CIRCUMFERENCE,
  RING_RADIUS,
  RING_STROKE,
  formatBytes,
  formatEta,
  MILESTONES,
} from '@network/shared';
import { useRawUpload } from '../../video/hooks/useRawUpload';
import { useEffect, useRef, useState } from 'react';
import { fireMilestoneBurst } from '../../gamification/confetti';
import type { DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, FileVideo, UploadCloud, X } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface VideoUploadFormProps {
  onUploaded: (videoId: string, gamification: IGamificationEvent) => void;
}

const VideoUploadForm = ({ onUploaded }: VideoUploadFormProps) => {
  const { state, startUpload, cancelUpload } = useRawUpload();
  const [isDragging, setIsDragging] = useState(false);
  const firedMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (state.stage === 'done' && state.videoId && state.gamification) {
      onUploaded(state.videoId, state.gamification);
    }
  }, [state.stage]);

  useEffect(() => {
    for (const milestone of MILESTONES) {
      if (
        state.progressPercent >= milestone &&
        !firedMilestones.current.has(milestone)
      ) {
        firedMilestones.current.add(milestone);
        fireMilestoneBurst();
      }
    }
  }, [state.progressPercent]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      firedMilestones.current = new Set();
      startUpload(file);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const isActive = [
    'validating',
    'requesting',
    'uploading',
    'confirming',
  ].includes(state.stage);

  if (isActive) {
    const dashOffset =
      RING_CIRCUMFERENCE - (state.progressPercent / 100) * RING_CIRCUMFERENCE;

    const statusLabel =
      state.stage === 'validating'
        ? 'Checking your file…'
        : state.stage === 'requesting'
          ? 'Getting ready…'
          : state.stage === 'confirming'
            ? 'Almost there…'
            : 'Uploading…';

    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div
          className="relative"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              className="text-surface-overlay"
              stroke="currentColor"
            />

            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              stroke="var(--color-primary)"
              strokeDasharray={RING_CIRCUMFERENCE}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-display text-text-primary">
              {state.stage === 'uploading' ? `${state.progressPercent}%` : ''}
            </span>
            {state.stage === 'uploading' && (
              <span className="text-[0.65rem] text-text-muted mt-0.5">
                {formatEta(state.etaSeconds)}
              </span>
            )}
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-text-primary">
          {statusLabel}
        </p>

        {state.stage === 'uploading' && (
          <p className="mt-1 text-xs text-text-muted tabular-nums">
            {formatBytes(state.uploadedBytes)} / {formatBytes(state.totalBytes)}
            {state.speedBytesPerSec > 0 &&
              ` · ${formatBytes(state.speedBytesPerSec)}/s`}
          </p>
        )}

        <p className="mt-1 text-xs text-text-muted truncate max-w-xs">
          {state.file?.name}
        </p>

        <button
          type="button"
          onClick={cancelUpload}
          className="mt-6 flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Cancel upload
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('video-file-input')?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 px-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : 'border-border bg-surface-raised hover:border-primary/40'
        )}
      >
        <input
          id="video-file-input"
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <motion.div
          animate={
            isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: [0, -4, 0] }
          }
          transition={
            isDragging
              ? { duration: 0.2 }
              : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-muted"
        >
          {isDragging ? (
            <FileVideo className="w-7 h-7 text-primary" />
          ) : (
            <UploadCloud className="w-7 h-7 text-primary" />
          )}
        </motion.div>

        <div>
          <p className="text-base font-semibold text-text-primary font-display">
            {isDragging ? 'Drop it like it’s hot' : 'Drag & drop your video'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            or click to browse · MP4, MOV, WebM, MKV · up to 5GB
          </p>
        </div>
      </div>

      <AnimatePresence>
        {state.stage === 'error' && state.error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-error/30 bg-error-subtle px-3.5 py-2.5 text-sm text-error"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoUploadForm;
