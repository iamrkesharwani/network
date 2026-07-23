const VOICE_MIME_TYPE_CANDIDATES = ['audio/webm;codecs=opus', 'audio/mp4'];

export const pickVoiceMimeType = (): string =>
  VOICE_MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ??
  '';

export const isVoiceRecordingSupported = (): boolean =>
  typeof MediaRecorder !== 'undefined' && pickVoiceMimeType() !== '';
