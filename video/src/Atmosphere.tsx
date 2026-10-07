import { AbsoluteFill, random, useVideoConfig } from 'remotion';
import { CYAN, PINK, energy, loopT } from './loop';

const HAZE = [
  { color: '#7a1fa8', x: 0.25, y: 0.35, size: 0.7, cycles: 1, phase: 0 },
  { color: PINK, x: 0.75, y: 0.6, size: 0.55, cycles: 1, phase: 0.33 },
  { color: '#1a4dff', x: 0.5, y: 0.8, size: 0.6, cycles: 2, phase: 0.66 },
];

const SPOT_COLORS = [PINK, CYAN, '#ffffff', '#ffe14d'];

const SPOTS = Array.from({ length: 22 }, (_, i) => ({
  angle: random(`angle-${i}`) * Math.PI * 2,
  radius: 0.35 + random(`radius-${i}`) * 0.65,
  direction: random(`dir-${i}`) > 0.5 ? 1 : -1,
  size: 10 + random(`size-${i}`) * 26,
  color: SPOT_COLORS[i % SPOT_COLORS.length],
}));

/** Drifting coloured haze plus disco-ball reflections sweeping the room. */
export const Atmosphere = ({ frame }: { frame: number }) => {
  const { width, height } = useVideoConfig();
  const t = loopT(frame);
  const level = energy(frame);
  const span = Math.max(width, height);

  return (
    <AbsoluteFill>
      {HAZE.map((h) => {
        const a = 2 * Math.PI * (t * h.cycles + h.phase);
        const size = span * h.size;
        return (
          <div
            key={h.color}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              left: width * h.x + Math.cos(a) * width * 0.08 - size / 2,
              top: height * h.y + Math.sin(a) * height * 0.06 - size / 2,
              borderRadius: '50%',
              background: h.color,
              opacity: 0.18 + 0.12 * level,
              filter: `blur(${span * 0.09}px)`,
            }}
          />
        );
      })}
      {SPOTS.map((s, i) => {
        const a = s.angle + 2 * Math.PI * t * s.direction;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s.size,
              height: s.size,
              left: width / 2 + Math.cos(a) * width * 0.48 * s.radius,
              top: height * 0.5 + Math.sin(a) * height * 0.45 * s.radius,
              borderRadius: '50%',
              background: s.color,
              opacity: 0.25 + 0.55 * level,
              boxShadow: `0 0 ${s.size * 1.5}px ${s.size / 2}px ${s.color}`,
              filter: 'blur(2px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
