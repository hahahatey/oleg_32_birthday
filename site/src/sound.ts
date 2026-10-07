// All sounds are synthesised — no audio files, no licensing. Only ever called from user gestures.
let ctx: AudioContext | null = null;
const audio = (): AudioContext => (ctx ??= new AudioContext());

/** Short "mic tap" pop when a song lands in a slot. */
export const playClick = (): void => {
  const a = audio();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.frequency.setValueAtTime(900, a.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, a.currentTime + 0.09);
  gain.gain.setValueAtTime(0.25, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.12);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + 0.12);
};

/** Crowd applause: hundreds of tiny noise bursts, densest at the start. */
export const playApplause = (): void => {
  const a = audio();
  const seconds = 3.5;
  const buffer = a.createBuffer(1, a.sampleRate * seconds, a.sampleRate);
  const data = buffer.getChannelData(0);
  const clapLength = Math.floor(a.sampleRate * 0.015);
  for (let c = 0; c < 700; c++) {
    const start = Math.floor(Math.pow(Math.random(), 1.6) * (data.length - clapLength));
    const volume = 0.15 + Math.random() * 0.25;
    for (let i = 0; i < clapLength; i++) data[start + i] += (Math.random() * 2 - 1) * volume * Math.exp(-i / (clapLength / 5));
  }
  const source = a.createBufferSource();
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1600;
  filter.Q.value = 0.7;
  source.buffer = buffer;
  source.connect(filter).connect(a.destination);
  source.start();
};

/** Brassy C-major "ta-da-da-daaa". */
export const playFanfare = (): void => {
  const a = audio();
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const at = a.currentTime + i * 0.13;
    const length = i === 3 ? 0.9 : 0.14;
    const osc = a.createOscillator();
    const filter = a.createBiquadFilter();
    const gain = a.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 2400;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.12, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, at + length);
    osc.connect(filter).connect(gain).connect(a.destination);
    osc.start(at);
    osc.stop(at + length);
  });
};
