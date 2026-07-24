import { useRef, useState } from 'react';
import { X, Timer, Image, Mic, Square } from 'lucide-react';
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
  const [isTtlMenuOpen, setIsTtlMenuOpen] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
          <input
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
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
          />

          <button
            type="button"
            onClick={handlePickImage}
            disabled={isBusy}
            aria-label="Send an image"
            className="shrink-0 rounded-lg border border-border p-2 text-icon hover:bg-surface-raised hover:text-icon-hover disabled:opacity-60"
          >
            <Image className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isBusy}
            aria-label="Record a voice note"
            className="shrink-0 rounded-lg border border-border p-2 text-icon hover:bg-surface-raised hover:text-icon-hover disabled:opacity-60"
          >
            <Mic className="h-4 w-4" strokeWidth={1.75} />
          </button>

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
              <Timer className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {isTtlMenuOpen && (
              <div className="absolute bottom-full right-0 z-10 mb-1 w-52 rounded-lg border border-border bg-surface shadow-lg">
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
