import { useReducedMotion, type Transition } from 'framer-motion';

export const useMotionSafe = () => {
  const reduce = useReducedMotion();
  return {
    reduce: Boolean(reduce),
    spring: (preset: Transition): Transition =>
      reduce ? { duration: 0 } : preset,
  };
};
