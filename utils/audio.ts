
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playNote = (midiNote: number) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Frequency calculation from MIDI
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  
  // Plucked sound characteristics: Sawtooth + Triangle mix or Triangle with fast decay
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

  // Simple ADSR-like envelope for "pluck"
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01); // Fast attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Long decay

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(now + 1.3);
};
