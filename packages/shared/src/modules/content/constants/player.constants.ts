import { TEN_SECONDS_MS } from '../../general/time.constants.js';

export const PLAYER_PLAYBACK_RATES = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 2,
] as const;
export const PLAYER_SEEK_STEP_SECONDS = 5;
export const PLAYER_VOLUME_STEP = 0.1;
export const PLAYER_CONTROLS_AUTO_HIDE_MS = 3000;
export const PLAYER_DOUBLE_TAP_SEEK_SECONDS = 10;
export const PLAYER_DOUBLE_TAP_WINDOW_MS = 300;
export const PLAYER_TELEMETRY_INTERVAL_MS = TEN_SECONDS_MS;
