import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Atmosphere } from './Atmosphere';
import { DiscoBall } from './DiscoBall';
import { Equalizer } from './Equalizer';
import { NeonSign } from './NeonSign';

export const Scene = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a0a40 0%, #12041d 55%, #06020b 100%)' }}>
      <Atmosphere frame={frame} />
      <DiscoBall frame={frame} />
      <NeonSign frame={frame} portrait={portrait} />
      <Equalizer frame={frame} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};
