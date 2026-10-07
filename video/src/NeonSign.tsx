import { loadFont as loadPacifico } from '@remotion/google-fonts/Pacifico';
import { loadFont as loadMonoton } from '@remotion/google-fonts/Monoton';
import type { CSSProperties } from 'react';
import { AbsoluteFill } from 'remotion';
import { CYAN, PINK, neonLevel } from './loop';

const { fontFamily: script } = loadPacifico('normal', { weights: ['400'], subsets: ['cyrillic', 'latin'] });
const { fontFamily: tubes } = loadMonoton('normal', { weights: ['400'], subsets: ['latin'] });

// Frames where the "е" tube buzzes, like a real worn-out sign.
const BUZZ = new Set([128, 129, 133, 176, 177, 178, 210]);

const tube = ({ color, level }: { color: string; level: number }): CSSProperties => ({
  color: level > 0 ? '#fff5fd' : color,
  opacity: 0.16 + 0.84 * level,
  textShadow:
    level > 0
      ? [6, 16, 36, 70, 130].map((b) => `0 0 ${b * level}px ${color}`).join(', ')
      : 'none',
});

/** "Олег" in script neon, "32" in multi-line tube neon, inside a cyan frame. */
export const NeonSign = ({ frame, portrait }: { frame: number; portrait: boolean }) => {
  const name = neonLevel({ frame, onAt: 55, offAt: 245 });
  const age = neonLevel({ frame, onAt: 95, offAt: 255 });
  const size = portrait ? 230 : 250;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: portrait ? 'column' : 'row',
        gap: portrait ? 0 : 60,
        // Portrait: lift the sign so the lower third stays free for the HTML lyrics + button.
        paddingTop: portrait ? 0 : 140,
        paddingBottom: portrait ? 380 : 0,
      }}
    >
      <div style={{ fontFamily: script, fontSize: size, lineHeight: 1.3, transform: 'rotate(-6deg)' }}>
        {[...'Олег'].map((letter, i) => (
          <span key={i} style={tube({ color: PINK, level: i === 2 && BUZZ.has(frame) ? name * 0.25 : name })}>
            {letter}
          </span>
        ))}
      </div>
      <div
        style={{
          fontFamily: tubes,
          fontSize: size * 1.05,
          lineHeight: 1,
          padding: '10px 36px 22px',
          borderRadius: 40,
          border: `5px solid ${age > 0 ? '#e9feff' : CYAN}`,
          boxShadow: age > 0 ? `0 0 20px ${CYAN}, 0 0 60px ${CYAN}, inset 0 0 30px ${CYAN}` : 'none',
          ...tube({ color: CYAN, level: age }),
        }}
      >
        32
      </div>
    </AbsoluteFill>
  );
};
