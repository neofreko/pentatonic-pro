
import { BackingTrack, SequencerState } from '../types';

export class BackingTrackService {
  private audioCtx: AudioContext | null = null;
  private track: BackingTrack | null = null;
  private targetKey: string = 'A';
  private isPlaying: boolean = false;
  private currentBeat: number = 0;
  private tempo: number = 120;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private lookAhead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // seconds

  constructor() {}

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
  }

  public setTargetKey(key: string) {
    this.targetKey = key;
    console.log(`[BackingTrackService] Target key set to ${key}`);
  }

  public getState(): SequencerState {
    return {
      isPlaying: this.isPlaying,
      currentBeat: this.currentBeat,
      currentBar: Math.floor(this.currentBeat / (this.track?.timeSignature[0] || 4)) + 1,
      totalBeats: this.calculateTotalBeats(),
      tempo: this.tempo
    };
  }

  private calculateTotalBeats(): number {
    if (!this.track) return 0;
    return this.track.progression.reduce((acc, chord) => acc + chord.duration, 0);
  }

  public setTempo(bpm: number) {
    if (bpm < 40 || bpm > 240) {
      console.error(`[BackingTrackService] Invalid tempo: ${bpm}. Must be 40-240.`);
      throw new Error('Tempo must be between 40 and 240 BPM');
    }
    this.tempo = bpm;
    console.log(`[BackingTrackService] Tempo set to ${bpm} BPM`);
  }

  public loadTrack(track: BackingTrack) {
    if (!track.progression || track.progression.length === 0) {
      console.error('[BackingTrackService] Load failed: Empty progression.');
      throw new Error('Progression must contain at least one chord');
    }
    this.track = track;
    this.tempo = track.tempo;
    this.currentBeat = 0;
    console.log(`[BackingTrackService] Loaded track: ${track.name}`);
  }

  public async start() {
    this.initAudio();
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.nextNoteTime = this.audioCtx!.currentTime;
    this.scheduler();
    console.log('[BackingTrackService] Playback started');
  }

  public async playNoodle() {
    this.initAudio();
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
    
    if (!this.track?.noodleSample || !this.audioCtx) return;

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const targetKeyIndex = notes.indexOf(this.targetKey.toUpperCase().replace('S', '#'));
    
    // Base MIDI for guitar range (Octave 4)
    const baseMidi = 48 + (targetKeyIndex === -1 ? 9 : targetKeyIndex); 
    
    const now = this.audioCtx.currentTime;
    this.track.noodleSample.forEach((offset, i) => {
      this.playGuitarNote(baseMidi + offset, now + (i * 0.25));
    });
  }

  private playGuitarNote(midi: number, time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.8);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID as any);
      this.timerID = null;
    }
    this.currentBeat = 0;
    console.log('[BackingTrackService] Playback stopped');
  }

  private scheduler() {
    if (!this.isPlaying || !this.audioCtx) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextBeat();
    }
    
    this.timerID = setTimeout(() => this.scheduler(), this.lookAhead) as any;
  }

  private nextBeat() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat;
    
    const totalBeats = this.calculateTotalBeats();
    this.currentBeat++;
    if (this.currentBeat >= totalBeats) {
      this.currentBeat = 0; // Loop
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.audioCtx || !this.track) return;

    const beatsPerBar = this.track.timeSignature[0] || 4;
    const barBeat = beatNumber % beatsPerBar;
    
    // Find current chord
    let accumulatedBeats = 0;
    let currentChord = this.track.progression[0];
    for (const chord of this.track.progression) {
      if (beatNumber < accumulatedBeats + chord.duration) {
        currentChord = chord;
        break;
      }
      accumulatedBeats += chord.duration;
    }

    // --- TRANSPOSITION LOGIC ---
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const trackKeyIndex = notes.indexOf(this.track.key.toUpperCase().replace('S', '#'));
    const targetKeyIndex = notes.indexOf(this.targetKey.toUpperCase().replace('S', '#'));
    const chordRootIndex = notes.indexOf(currentChord.root.toUpperCase().replace('S', '#'));

    if (trackKeyIndex !== -1 && targetKeyIndex !== -1 && chordRootIndex !== -1) {
      const interval = (targetKeyIndex - trackKeyIndex + 12) % 12;
      const transposedRootIndex = (chordRootIndex + interval) % 12;
      const transposedRoot = notes[transposedRootIndex];

      // --- DRUMS ---
      if (this.track.style === 'rock' || this.track.style === 'funk') {
        if (barBeat === 0 || barBeat === 2) {
          this.playKick(time);
        } else if (barBeat === 1 || barBeat === 3) {
          this.playSnare(time);
        }
        this.playHiHat(time);
      } else if (this.track.style === 'blues') {
        this.playKick(time);
        if (barBeat === 1 || barBeat === 3) {
          this.playSnare(time, 0.5);
        }
        this.playHiHat(time);
      }

      // --- BASS ---
      this.playBass(transposedRoot, time);

      // --- CHORDS ---
      // Play full chord on the first beat of every bar
      if (barBeat === 0) {
        this.playChord(transposedRoot, currentChord.quality, time);
      }
    }
  }

  private playKick(time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playSnare(time: number, volume = 1.0) {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 0.1;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.2 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start(time);
    noise.stop(time + 0.1);
  }

  private playHiHat(time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(10000, time);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private playBass(root: string, time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Map note to MIDI then to frequency
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = notes.indexOf(root.toUpperCase().replace('S', '#'));
    if (rootIndex === -1) return;

    // Bass octave 1 or 2
    const midi = 24 + rootIndex; 
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  private playChord(root: string, quality: string, time: number) {
    if (!this.audioCtx) return;

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = notes.indexOf(root.toUpperCase().replace('S', '#'));
    if (rootIndex === -1) return;

    // Middle register for chords (Octave 4)
    const baseMidi = 48 + rootIndex;

    // Define intervals based on quality
    let intervals = [0, 4, 7]; // Major default
    if (quality === 'minor' || quality === 'm' || quality === 'm7') intervals = [0, 3, 7];
    if (quality === '7') intervals = [0, 4, 7, 10];
    if (quality === 'maj7') intervals = [0, 4, 7, 11];
    if (quality === 'dim') intervals = [0, 3, 6];

    intervals.forEach(interval => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const freq = 440 * Math.pow(2, (baseMidi + interval - 69) / 12);

      osc.type = 'sine'; // Soft, pad-like sound
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.1); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.0); // Long decay

      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.start(time);
      osc.stop(time + 1.0);
    });
  }
}
