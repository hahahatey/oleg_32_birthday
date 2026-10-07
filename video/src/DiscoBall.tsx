import { random, useVideoConfig } from 'remotion';
import { energy, loopT } from './loop';

const ROWS = 14;
const COLS = 28;
// Rotating by a whole number of tile columns per loop keeps the loop seamless.
const COLUMNS_PER_LOOP = 7;

/** Mirror ball hanging from the ceiling, rotating with twinkling facets. */
export const DiscoBall = ({ frame }: { frame: number }) => {
  const { width, height } = useVideoConfig();
  const t = loopT(frame);
  const level = energy(frame);
  const r = Math.min(width, height) * 0.085;
  const cx = width / 2;
  const cy = height * (height > width ? 0.13 : 0.17);
  const rotation = t * COLUMNS_PER_LOOP * ((2 * Math.PI) / COLS);

  const tiles = Array.from({ length: ROWS * COLS }, (_, i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const lat = -Math.PI / 2 + ((row + 0.5) * Math.PI) / ROWS;
    const lon = (col * 2 * Math.PI) / COLS + rotation;
    const depth = Math.cos(lat) * Math.cos(lon);
    if (depth <= 0.02) return null;
    const twinkle = Math.pow(Math.max(0, Math.sin(2 * Math.PI * (t * 3 + random(`tile-${i}`)))), 40);
    const light = Math.min(1, 0.15 + 0.55 * depth * (0.6 - 0.4 * Math.sin(lat)) + twinkle * level);
    const w = r * Math.cos(lat) * ((2 * Math.PI) / COLS) * Math.cos(lon) * 0.88;
    const h = r * (Math.PI / ROWS) * Math.cos(lat) * 0.88 + 1;
    return (
      <rect
        key={i}
        x={cx + r * Math.cos(lat) * Math.sin(lon) - w / 2}
        y={cy + r * Math.sin(lat) - h / 2}
        width={w}
        height={h}
        fill={`hsl(${280 + 40 * Math.sin(lon)}, ${30 - 25 * twinkle}%, ${12 + 80 * light}%)`}
      />
    );
  });

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="ball-glow">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35 * level} />
          <stop offset="100%" stopColor="#ff2bd6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <line x1={cx} y1={0} x2={cx} y2={cy - r} stroke="#8a7a99" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r * 2.4} fill="url(#ball-glow)" />
      <circle cx={cx} cy={cy} r={r} fill="#160b20" />
      {tiles}
    </svg>
  );
};
