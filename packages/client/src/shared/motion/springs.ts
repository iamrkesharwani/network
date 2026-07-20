import type { Transition } from 'framer-motion';

export const SPRINGS: Record<'smooth' | 'snappy' | 'bouncy', Transition> = {
  smooth: { type: 'spring', stiffness: 220, damping: 30 },
  snappy: { type: 'spring', stiffness: 500, damping: 35 },
  bouncy: { type: 'spring', stiffness: 260, damping: 18, mass: 1 },
};

export const DURATIONS = {
  micro: 0.12,
  fast: 0.18,
} as const;
