import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Timer, Image, Camera, Mic, Square, Plus, MoreVertical } from 'lucide-react';
import {
  MESSAGE_ATTACHMENT_MAX_BYTES,
  MESSAGE_ATTACHMENT_MAX_VOICE_DURATION_MS,
  formatDuration,
  formatBytes,
  type ConversationDisappearingTtl,
  type MessageAttachmentType,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import Button from '../../../shared/ui/primitives/Button';
import { pickVoiceMimeType } from '../utils/voiceRecorder';

interface MessageInputProps {
  onSend: (text: string, ttlOverride?: ConversationDisappearingTtl) => Promise<void>;
  onSendAttachment: (
    file: File,
    type: MessageAttachmentType,
    duration?: number
  ) => Promise<void>;
  onTyping: () => void;
  replyToLabel?: string;
  onCancelReply?: () => void;
}

const COLLAPSIBLE_TRANSITION = { duration: 0.2 };

const TTL_OVERRIDE_OPTIONS: {
  ttl: ConversationDisappearingTtl | undefined;
  label: string;
}[] = [
  { ttl: undefined, label: 'Use conversation default' },
  { ttl: 'off', label: 'Off for this message' },
  { ttl: '24h', label: '24 hours' },
  { ttl: '7d', label: '7 days' },
];

const MessageInput = ({
  onSend,
  onSendAttachment,
  onTyping,
  replyToLabel,
  onCancelReply,
}: MessageInputProps) => {
  const [draft, setDraft] = useState('');
  const [ttlOverride, setTtlOverride] = useState<ConversationDisappearingTtl | undefined>(
    undefined
  );
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isTtlMenuOpen, setIsTtlMenuOpen] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingStartedAtRef = useRef(0);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await onSend(text, ttlOverride);
    setTtlOverride(undefined);
  };

  const handlePickImage = () => {
    setAttachmentError(null);
    fileInputRef.current?.click();
  };

  const handlePickCamera = () => {
    setAttachmentError(null);
    cameraInputRef.current?.click();
  };

  const handleImageSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MESSAGE_ATTACHMENT_MAX_BYTES) {
      setAttachmentError(
        `Images can't be larger than ${formatBytes(MESSAGE_ATTACHMENT_MAX_BYTES)}.`
      );
      return;
    }

    setIsUploadingAttachment(true);
    setAttachmentError(null);
    try {
      await onSendAttachment(file, 'image');
    } catch {
      setAttachmentError("Couldn't send that image. Please try again.");
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  };

  const stopRecordingStream = () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
  };

  const handleStartRecording = async () => {
    setAttachmentError(null);
    const mimeType = pickVoiceMimeType();
    if (!mimeType) {
      setAttachmentError('Voice notes are not supported in this browser.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setAttachmentError('Microphone access was denied.');
      return;
    }

    recordingStreamRef.current = stream;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();

    recordingStartedAtRef.current = Date.now();
    setIsRecording(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);
    autoStopTimeoutRef.current = setTimeout(() => {
      handleStopRecording();
    }, MESSAGE_ATTACHMENT_MAX_VOICE_DURATION_MS);
  };

  const handleStopRecording = () => {
    stopRecordingTimer();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    recorder.onstop = async () => {
      stopRecordingStream();
      const mimeType = recorder.mimeType;
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const duration = Math.round(
        (Date.now() - recordingStartedAtRef.current) / 1000
      );
      setIsRecording(false);

      if (blob.size === 0) return;

      const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
      const file = new File([blob], `voice-note.${extension}`, {
        type: mimeType,
      });

      setIsUploadingAttachment(true);
      try {
        await onSendAttachment(file, 'voice', duration);
      } catch {
        setAttachmentError("Couldn't send that voice note. Please try again.");
      } finally {
        setIsUploadingAttachment(false);
      }
    };
    recorder.stop();
  };

  const handleCancelRecording = () => {
    stopRecordingTimer();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    stopRecordingStream();
    recordedChunksRef.current = [];
    setIsRecording(false);
  };

  const isBusy = isUploadingAttachment;
  const shouldCollapseIcons = draft.trim().length > 0;

  return (
    <div className="border-t border-border pt-3">
      {replyToLabel && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-raised px-3 py-1.5 text-xs">
          <span className="truncate text-text-muted">
            Replying to {replyToLabel}
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {ttlOverride && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-raised px-3 py-1.5 text-xs">
          <span className="text-text-muted">
            {ttlOverride === 'off'
              ? "This message won't disappear"
              : `This message disappears after ${ttlOverride === '24h' ? '24 hours' : '7 days'}`}
          </span>
          <button
            type="button"
            onClick={() => setTtlOverride(undefined)}
            aria-label="Clear disappearing-message override"
            className="shrink-0 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {attachmentError && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-surface-raised px-3 py-1.5 text-xs">
          <span className="text-error">{attachmentError}</span>
          <button
            type="button"
            onClick={() => setAttachmentError(null)}
            aria-label="Dismiss attachment error"
            className="shrink-0 text-text-muted hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelected}
        className="hidden"
      />

      {isRecording ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-error/40 bg-surface-raised px-3 py-2 text-sm">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-error" />
            <span className="text-text-primary">
              Recording… {formatDuration(recordingSeconds)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelRecording}
            aria-label="Cancel voice note"
            className="shrink-0 rounded-lg border border-border p-2 text-icon hover:bg-surface-raised hover:text-icon-hover"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={handleStopRecording}
            aria-label="Stop and send voice note"
            className="shrink-0 rounded-lg bg-primary p-2 text-white hover:bg-primary/90"
          >
            <Square className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <motion.input
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                onTyping();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSend();
              }}
              placeholder="Type a message..."
              disabled={isBusy}
              animate={{ paddingLeft: shouldCollapseIcons ? 12 : 36 }}
              transition={COLLAPSIBLE_TRANSITION}
              className="w-full rounded-lg border border-border bg-surface-raised py-2 pr-3 text-sm outline-none focus:border-primary disabled:opacity-60"
            />

            <motion.div
              className="absolute left-1 top-1/2 -translate-y-1/2"
              animate={{ opacity: shouldCollapseIcons ? 0 : 1 }}
              transition={COLLAPSIBLE_TRANSITION}
              style={{ pointerEvents: shouldCollapseIcons ? 'none' : 'auto' }}
            >
              <button
                type="button"
                onClick={() => setIsAttachMenuOpen((open) => !open)}
                disabled={isBusy}
                aria-label="Add attachment"
                className="rounded-md p-1 text-icon hover:bg-surface hover:text-icon-hover disabled:opacity-60"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </button>

              {isAttachMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsAttachMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-full left-0 z-20 mb-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        handlePickImage();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
                    >
                      <Image className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        handlePickCamera();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
                    >
                      <Camera className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        handleStartRecording();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-raised"
                    >
                      <Mic className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      Voice note
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsTtlMenuOpen((open) => !open)}
              aria-label="Disappearing message options for this message"
              className={cn(
                'rounded-lg border border-border p-2 text-icon hover:bg-surface-raised hover:text-icon-hover',
                ttlOverride && 'border-primary text-primary'
              )}
            >
              <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {isTtlMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsTtlMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute bottom-full right-0 z-20 mb-1 w-52 rounded-lg border border-border bg-surface shadow-lg">
                  <p className="px-3 pb-1 pt-1.5 text-xs font-medium text-text-muted">
                    <Timer className="mr-1.5 inline h-3 w-3" strokeWidth={1.75} />
                    Disappearing message
                  </p>
                  {TTL_OVERRIDE_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setTtlOverride(option.ttl);
                        setIsTtlMenuOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-left text-xs hover:bg-surface-raised',
                        option.ttl === ttlOverride ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button onClick={handleSend} isLoading={isBusy}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
