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

// Guitar Synth: Karplus-Strong physical modeling
const guitarSynth = new Tone.PluckSynth({
  attackNoise: 1,
  dampening: 4000,
  resonance: 0.95,
  volume: -6
}).connect(compressor);

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

export const playNote = (midiNote: number) => {
  const freq = Tone.Frequency(midiNote, "midi").toFrequency();
  guitarSynth.triggerAttack(freq, Tone.now());
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
      guitarSynth.triggerAttack(freq, time);
      
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
      guitarSynth.set({ dampening: 4000, resonance: 0.95 });
      reverb.set({ wet: 0.3 });
      break;
    case 'crunch':
      guitarSynth.set({ dampening: 2000, resonance: 0.8 });
      reverb.set({ wet: 0.4 });
      break;
    case 'dreamy':
      guitarSynth.set({ dampening: 6000, resonance: 0.98 });
      reverb.set({ wet: 0.6 });
      break;
  }
};
