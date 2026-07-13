import { useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  FileVideo,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  RING_SIZE,
  RING_CIRCUMFERENCE,
  RING_RADIUS,
  RING_STROKE,
  formatBytes,
  formatEta,
  type IPersistedUploadPointer,
  type UploadState,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS } from '../../../shared/motion/springs';

interface MediaDropzoneProps {
  state: UploadState;
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
  accept?: string;
  resumePointer?: IPersistedUploadPointer | null;
  onDiscardResume?: () => void;
  onContinueResume?: () => void;
}

const DROPZONE_HEIGHT = 'h-64';

const MediaDropzone = ({
  state,
  onFileSelect,
  onCancel,
  title = 'Drag & drop your media',
  subtitle = 'or click to browse',
  accept = 'video/mp4,video/quicktime,video/webm',
  resumePointer,
  onDiscardResume,
  onContinueResume,
}: MediaDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      onFileSelect(file);
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
  const isPreUpload = state.stage === 'validating' || state.stage === 'requesting';
  const isResuming = !!resumePointer && state.stage === 'idle';
  const isPlainIdle = !isActive && !isResuming;

  const displayPercent = Math.min(100, 20 + state.progressPercent * 0.8);
  const dashOffset =
    RING_CIRCUMFERENCE - (displayPercent / 100) * RING_CIRCUMFERENCE;

  const statusLabel =
    state.stage === 'validating'
      ? 'Checking your file…'
      : state.stage === 'requesting'
        ? 'Getting ready…'
        : state.stage === 'confirming'
          ? 'Almost there…'
          : 'Uploading…';

  const resumePercent =
    resumePointer && resumePointer.totalParts > 0
      ? Math.round(
          (resumePointer.uploadedParts.length / resumePointer.totalParts) * 100
        )
      : 0;

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (!isPlainIdle) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => isPlainIdle && setIsDragging(false)}
        onDrop={(e) => isPlainIdle && onDrop(e)}
        onClick={() =>
          isPlainIdle && document.getElementById('media-file-input')?.click()
        }
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors',
          DROPZONE_HEIGHT,
          isPlainIdle && 'cursor-pointer',
          isDragging
            ? 'border-primary bg-primary-subtle'
            : isResuming
              ? 'border-primary/40 bg-primary-subtle'
              : 'border-border bg-surface-raised hover:border-primary/40'
        )}
      >
        <input
          id="media-file-input"
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isActive && (
          <>
            <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
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
                  transition={
                    isPreUpload ? SPRINGS.snappy : { duration: 0.3, ease: 'easeOut' }
                  }
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-3 text-center">
                <span className="text-xl font-bold font-display text-text-primary leading-none">
                  {state.stage === 'uploading'
                    ? `${Math.round(displayPercent)}%`
                    : ''}
                </span>
                <span className="text-[0.62rem] font-medium text-text-primary leading-tight">
                  {statusLabel}
                </span>
                {state.stage === 'uploading' && (
                  <span className="text-[0.58rem] text-text-muted leading-tight">
                    {formatEta(state.etaSeconds)}
                  </span>
                )}
              </div>
            </div>

            <div className="max-w-[15rem]">
              {state.stage === 'uploading' && (
                <p className="text-[0.7rem] text-text-muted tabular-nums">
                  {formatBytes(state.uploadedBytes)} /{' '}
                  {formatBytes(state.totalBytes)}
                  {state.speedBytesPerSec > 0 &&
                    ` · ${formatBytes(state.speedBytesPerSec)}/s`}
                </p>
              )}

              <p className="mt-0.5 text-[0.7rem] text-text-muted truncate">
                {state.file?.name}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel upload
            </button>
          </>
        )}

        {isResuming && resumePointer && resumePointer.step === 'drop' && (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-muted">
              <FileVideo className="w-6 h-6 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary font-display">
                Resume your upload?
              </p>
              <p className="mt-1 text-xs text-text-muted truncate max-w-xs">
                {resumePointer.fileName || 'Your file'} ·{' '}
                {formatBytes(resumePointer.fileSizeBytes)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {resumePercent}% already uploaded — select the same file to
                continue.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('media-file-input')?.click()
                }
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Select file to resume
              </button>

              <button
                type="button"
                onClick={onDiscardResume}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Start new
              </button>
            </div>
          </>
        )}

        {isResuming && resumePointer && resumePointer.step !== 'drop' && (
          <>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-muted">
              <FileVideo className="w-6 h-6 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold text-text-primary font-display">
                Unfinished upload
              </p>
              <p className="mt-1 text-xs text-text-muted truncate max-w-xs">
                {resumePointer.fileName || 'Your file'} finished uploading —
                pick up where you left off, or start a new one.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onContinueResume}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Continue
              </button>

              <button
                type="button"
                onClick={onDiscardResume}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Start new
              </button>
            </div>
          </>
        )}

        {isPlainIdle && (
          <>
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
                {isDragging ? 'Drop it like it’s hot' : title}
              </p>
              <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {state.stage === 'error' && state.error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-error/30 bg-error-subtle px-3.5 py-2.5 text-sm text-error">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {state.error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaDropzone;
