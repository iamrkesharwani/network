import { useEffect, useMemo, useState, type RefObject } from 'react';
import type { ICaptionTrack } from '@network/shared';

interface UseCaptionsResult {
  activeLanguage: string | 'off';
  activeCueText: string;
  setActiveLanguage: (language: string | 'off') => void;
}

function pickDefaultLanguage(captions: ICaptionTrack[]): string | 'off' {
  return captions.find((caption) => caption.isDefault)?.language ?? 'off';
}

export function useCaptions(
  videoRef: RefObject<HTMLVideoElement | null>,
  captions: ICaptionTrack[]
): UseCaptionsResult {
  const [activeLanguage, setActiveLanguage] = useState<string | 'off'>(() =>
    pickDefaultLanguage(captions)
  );
  const [activeCueText, setActiveCueText] = useState('');

  useEffect(() => {
    setActiveLanguage(pickDefaultLanguage(captions));
  }, [captions]);

  const trackSignature = useMemo(
    () => captions.map((caption) => `${caption.language}:${caption.isDefault}`).join(','),
    [captions]
  );

  useEffect(() => {
    const video = videoRef.current;
    setActiveCueText('');
    if (!video) return;

    const textTracks = video.textTracks;
    let activeTrack: TextTrack | null = null;

    for (let i = 0; i < textTracks.length; i += 1) {
      const track = textTracks[i];
      if (!track) continue;
      if (track.language === activeLanguage) {
        track.mode = 'hidden';
        activeTrack = track;
      } else {
        track.mode = 'disabled';
      }
    }

    if (!activeTrack) return;

    const handleCueChange = () => {
      const cues = activeTrack!.activeCues;
      if (!cues || cues.length === 0) {
        setActiveCueText('');
        return;
      }
      const text = Array.from(cues)
        .filter((cue): cue is VTTCue => cue instanceof VTTCue)
        .map((cue) => cue.text)
        .join('\n');
      setActiveCueText(text);
    };

    activeTrack.addEventListener('cuechange', handleCueChange);

    return () => {
      activeTrack!.removeEventListener('cuechange', handleCueChange);
      activeTrack!.mode = 'disabled';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- trackSignature is a deliberate proxy for `captions`, so this effect only re-runs on real language/default changes, not on every new array reference
  }, [videoRef, trackSignature, activeLanguage]);

  return {
    activeLanguage,
    activeCueText,
    setActiveLanguage,
  };
}
