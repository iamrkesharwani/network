import type { Transition } from 'framer-motion';

export const SPRINGS: Record<'smooth' | 'snappy', Transition> = {
  smooth: { type: 'spring', stiffness: 220, damping: 30 },
  snappy: { type: 'spring', stiffness: 500, damping: 35 },
};
