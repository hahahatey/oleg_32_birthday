import { random, useVideoConfig } from 'remotion';
import { CYAN, PINK, energy, loopT, wave } from './loop';

const BAR_WIDTH = 26;
const GAP = 12;
// Integer cycles per loop → seamless; 20 per 10s ≈ 120 BPM pulse.
const BEATS = [
  { cycles: 20, weight: 0.5 },
  { cycles: 10, weight: 0.3 },
  { cycles: 30, weight: 0.2 },
];

/** Glowing spectrum bars along the bottom edge, pumping with the party energy. */
export const Equalizer = ({ frame }: { frame: number }) => {
  const { width, height } = useVideoConfig();
  const t = loopT(frame);
  const level = energy(frame);
  const count = Math.floor(width / (BAR_WIDTH + GAP));
  const maxHeight = height * 0.16;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: GAP,
        height: maxHeight,
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const centre = 1 - Math.abs(i / (count - 1) - 0.5);
        const pulse = BEATS.reduce(
          (sum, b) => sum + b.weight * wave({ t, cycles: b.cycles, phase: random(`bar-${i}-${b.cycles}`) }),
          0,
        );
        return (
          <div
            key={i}
            style={{
              width: BAR_WIDTH,
              height: maxHeight * (0.08 + 0.92 * pulse * level * centre),
              borderRadius: '6px 6px 0 0',
              background: `linear-gradient(to top, ${PINK}, ${CYAN})`,
              boxShadow: `0 0 18px ${PINK}`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </div>
  );
};
