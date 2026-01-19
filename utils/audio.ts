
let audioCtx: AudioContext | null = null;
let currentPreset: 'clean' | 'crunch' | 'dreamy' = 'clean';

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Simple Distortion Curve
function makeDistortionCurve(amount: number) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export const setAudioPreset = (preset: 'clean' | 'crunch' | 'dreamy') => {
  currentPreset = preset;
};

export const playNote = (midiNote: number) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const now = ctx.currentTime;

  // Frequency calculation from MIDI
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(freq, now);

  // Initial Gain Setup
  gainNode.gain.setValueAtTime(0, now);

  // Routing based on preset
  let lastNode: AudioNode = gainNode;

  if (currentPreset === 'crunch') {
    const dist = ctx.createWaveShaper();
    dist.curve = makeDistortionCurve(100);
    dist.oversample = '4x';
    lastNode.connect(dist);
    lastNode = dist;

    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  } else if (currentPreset === 'dreamy') {
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.4;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.4;

    lastNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // Feedback
    delayGain.connect(ctx.destination);

    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
  } else {
    // Clean
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  }

  oscillator.connect(gainNode);
  lastNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(now + 2.5);
};
