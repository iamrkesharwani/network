import { PLAYER_PLAYBACK_RATES } from '@network/shared';
import Select from '../../../shared/ui/primitives/Select';

interface PlaybackSpeedControlProps {
  value: number;
  onChange: (rate: number) => void;
}

const RATE_OPTIONS = PLAYER_PLAYBACK_RATES.map((rate) => ({
  value: String(rate),
  label: `${rate}x`,
}));

const PlaybackSpeedControl = ({ value, onChange }: PlaybackSpeedControlProps) => (
  <Select
    value={String(value)}
    onChange={(next) => onChange(Number(next))}
    options={RATE_OPTIONS}
    containerClassName="mb-0 w-28"
  />
);

export default PlaybackSpeedControl;
