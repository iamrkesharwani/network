import confetti from 'canvas-confetti';

const PRIMARY = '#f97316';
const SECONDARY = '#fbbf24';
const TERTIARY = '#f0f0ed';

export const fireMilestoneBurst = () => {
  confetti({
    particleCount: 40,
    spread: 55,
    startVelocity: 30,
    gravity: 1.1,
    origin: { x: 0.5, y: 0.7 },
    colors: [PRIMARY, SECONDARY],
    scalar: 0.8,
    disableForReducedMotion: true,
  });
};

export const fireSuccessBurst = () => {
  const colors = [PRIMARY, SECONDARY, TERTIARY];
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.55 },
    colors,
    disableForReducedMotion: true,
  });
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 60,
    startVelocity: 50,
    origin: { x: 0, y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 60,
    startVelocity: 50,
    origin: { x: 1, y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
};

export const fireLevelUpBurst = () => {
  confetti({
    particleCount: 120,
    spread: 100,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.5 },
    colors: [PRIMARY, SECONDARY, TERTIARY],
    disableForReducedMotion: true,
    ticks: 220,
  });
};
