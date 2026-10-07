import { Composition } from 'remotion';
import { DURATION, FPS } from './loop';
import { Scene } from './Scene';

export const Root = () => (
  <>
    <Composition id="Landscape" component={Scene} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="Portrait" component={Scene} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
