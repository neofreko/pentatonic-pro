import * as Tone from 'tone';

// Effects Chain
const reverb = new Tone.Reverb({
  decay: 2.5,
  wet: 0.3
}).toDestination();

const compressor = new Tone.Compressor({
  threshold: -20,
  ratio: 3
}).connect(reverb);

// Guitar Sampler: Uses real acoustic guitar samples for realistic strumming
// Samples sourced from: https://github.com/nbrosowsky/tonejs-instruments
// Strumming timing logic inspired by: https://github.com/NghiaLam2026/Strum_It_Your_Way
const guitarSampler = new Tone.Sampler({
  urls: {
    "E2": "E2.mp3",
    "A2": "A2.mp3",
    "D3": "D3.mp3",
    "G3": "G3.mp3",
    "B3": "B3.mp3",
    "E4": "E4.mp3",
  },
  baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-acoustic/",
  onload: () => {
    console.log("Guitar samples loaded!");
  }
}).connect(compressor);
guitarSampler.volume.value = -6;

// Fallback Synth (for when samples are loading or if they fail)
const fallbackSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: {
    attack: 0.005,
    decay: 0.3,
    sustain: 0,
    release: 1
  }
}).connect(compressor);
fallbackSynth.volume.value = -6;

// Helper to choose instrument
const getGuitar = () => {
  return guitarSampler.loaded ? guitarSampler : fallbackSynth;
};

// Drone Synth: Warm background pad for jamming
const droneSynth = new Tone.MonoSynth({
  oscillator: { type: "sawtooth" },
  envelope: { attack: 2, decay: 1, sustain: 1, release: 4 },
  filterEnvelope: { attack: 2, decay: 0, sustain: 1, release: 4, baseFrequency: 200, octaves: 2 },
  volume: -24
}).connect(reverb);

// Metronome Synth: Percussive click
const metroSynth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 2,
  envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
  volume: -15
}).toDestination();

let activeSequence: Tone.Sequence | null = null;
let metronomeLoop: Tone.Loop | null = null;

export const initAudio = async () => {
  if (Tone.getTransport().state !== 'started') {
    await Tone.start();
    Tone.getTransport().start();
  }
};

export const setBpm = (bpm: number) => {
  Tone.getTransport().bpm.value = bpm;
};

export const playNote = async (midiNote: number) => {
  await initAudio();
  const freq = Tone.Frequency(midiNote, "midi").toFrequency();
  getGuitar().triggerAttackRelease(freq, "2m", Tone.now());
};

/**
 * Plays multiple notes at the exact same time.
 */
export const playChord = async (midiNotes: number[]) => {
  await initAudio();
  const freqs = midiNotes.map(m => Tone.Frequency(m, "midi").toFrequency());
  getGuitar().triggerAttackRelease(freqs, "2m", Tone.now());
};

/**
 * Plays multiple notes in a quick sequence to simulate a guitar strum.
 */
export const strumChord = async (midiNotes: number[]) => {
  await initAudio();
  const now = Tone.now();
  // Sort midis so we always strum from low to high
  const sortedMidis = [...midiNotes].sort((a, b) => a - b);
  const guitar = getGuitar();
  
  sortedMidis.forEach((midi, i) => {
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    // 30ms delay per string matches the reference repo's natural strum feel
    const timeOffset = i * 0.030;
    const velocity = 0.8 - (i * 0.05); // Slight decay in force across strings
    
    // Using "2m" (2 measures) lets the sample ring out naturally for a long time
    guitar.triggerAttackRelease(freq, "2m", now + timeOffset, velocity);
  });
};

/**
 * Toggles a continuous background drone of the root note.
 */
export const toggleDrone = (midiNote: number, isActive: boolean) => {
  if (isActive) {
    // Play an octave lower for a thick bass drone
    const freq = Tone.Frequency(midiNote - 12, "midi").toFrequency();
    droneSynth.triggerAttack(freq);
  } else {
    droneSynth.triggerRelease();
  }
};

export const startSequence = (
  notes: { midi: number, id: string }[], 
  onStep: (noteId: string | null) => void,
  onComplete: () => void,
  isLooping: boolean = false
) => {
  stopActiveSequence();

  activeSequence = new Tone.Sequence(
    (time, note) => {
      const freq = Tone.Frequency(note.midi, "midi").toFrequency();
      getGuitar().triggerAttackRelease(freq, "2n", time);
      
      Tone.Draw.schedule(() => {
        onStep(note.id);
      }, time);
    },
    notes,
    "8n"
  );

  activeSequence.loop = isLooping;
  activeSequence.start(0);

  if (!isLooping) {
    const duration = notes.length * Tone.Time("8n").toSeconds();
    Tone.getTransport().scheduleOnce(() => {
      Tone.Draw.schedule(() => {
        onComplete();
        onStep(null);
      }, Tone.now());
    }, `+${duration}`);
  }
};

export const stopActiveSequence = () => {
  if (activeSequence) {
    activeSequence.stop();
    activeSequence.dispose();
    activeSequence = null;
  }
};

export const toggleMetronome = (isActive: boolean) => {
  if (!metronomeLoop) {
    metronomeLoop = new Tone.Loop((time) => {
      const isDownbeat = Math.round(Tone.getTransport().seconds / Tone.Time("4n").toSeconds()) % 4 === 0;
      const pitch = isDownbeat ? "C5" : "C4";
      metroSynth.triggerAttackRelease(pitch, "32n", time);
    }, "4n");
  }

  if (isActive) {
    metronomeLoop.start(0);
  } else {
    metronomeLoop.stop();
  }
};

export const setAudioPreset = (preset: 'clean' | 'crunch' | 'dreamy') => {
  switch (preset) {
    case 'clean':
      reverb.set({ wet: 0.3 });
      fallbackSynth.set({ oscillator: { type: "triangle" } });
      break;
    case 'crunch':
      reverb.set({ wet: 0.4 });
      fallbackSynth.set({ oscillator: { type: "sawtooth" } }); // Crunchier fallback
      break;
    case 'dreamy':
      reverb.set({ wet: 0.6 });
      fallbackSynth.set({ oscillator: { type: "sine" } }); // Dreamier fallback
      break;
  }
};
