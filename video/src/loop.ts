import { interpolate } from 'remotion';

export const FPS = 30;
export const DURATION = 300;

export const PINK = '#ff2bd6';
export const CYAN = '#00f0ff';

/** Loop progress 0..1 — anything periodic in it with integer frequency loops seamlessly. */
export const loopT = (frame: number): number => frame / DURATION;

export const wave = ({ t, cycles, phase }: { t: number; cycles: number; phase: number }): number =>
  0.5 + 0.5 * Math.sin(2 * Math.PI * (t * cycles + phase));

const FLICKER_ON = '10100110101101';
const FLICKER_OFF = '110110100100';
const STEP = 2;

/** Neon tube level: dark → stuttering ignition → on → stuttering power-down → dark. */
export const neonLevel = ({ frame, onAt, offAt }: { frame: number; onAt: number; offAt: number }): number => {
  const onEnd = onAt + FLICKER_ON.length * STEP;
  const offEnd = offAt + FLICKER_OFF.length * STEP;
  if (frame < onAt || frame >= offEnd) return 0;
  if (frame < onEnd) return Number(FLICKER_ON[Math.floor((frame - onAt) / STEP)]);
  if (frame < offAt) return 1;
  return Number(FLICKER_OFF[Math.floor((frame - offAt) / STEP)]);
};

/** Overall party energy, low while the sign is dark. */
export const energy = (frame: number): number =>
  interpolate(frame, [0, 50, 95, 235, 285, DURATION], [0.35, 0.35, 1, 1, 0.35, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
