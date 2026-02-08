import { BackingTrack, SequencerState } from '../types';

/**
 * Service class responsible for scheduling and synthesizing backing tracks.
 * 
 * High-Resolution Refactor:
 * - Supports 8th-note sub-beat resolution for realistic rock and blues grooves.
 * - Pattern-based rhythm engine for Drums, Bass, and Chords.
 * - Karplus-Strong physical modeling for guitar lead.
 */
export class BackingTrackService {
  private audioCtx: AudioContext | null = null;
  private track: BackingTrack | null = null;
  private targetKey: string = 'A';
  private isPlaying: boolean = false;
  
  // Scheduling state
  private currentSubBeat: number = 0; // 8th notes (0-7 for a 4/4 bar)
  private tempo: number = 120;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  
  // AudioBuffer cache for Karplus-Strong Lead
  private bufferCache: Map<number, AudioBuffer> = new Map();
  
  // Scheduler tuning
  private lookAhead: number = 25.0; 
  private scheduleAheadTime: number = 0.1; 
  
  private audioPreset: 'clean' | 'crunch' | 'dreamy' = 'clean';

  constructor() {}

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
  }

  public setAudioPreset(preset: 'clean' | 'crunch' | 'dreamy') {
    if (this.audioPreset !== preset) {
      this.audioPreset = preset;
      this.bufferCache.clear(); // Recalculate strings for new tone
      console.log(`[BackingTrackService] Audio preset set to ${preset}`);
    }
  }

  /**
   * Sets the target key for transposition.
   * @param key - The new root note (e.g., 'G', 'F#')
   */
  public setTargetKey(key: string) {
    this.targetKey = key;
  }

  /**
   * Returns the current state of the sequencer for UI updates.
   */
  public getState(): SequencerState {
    return {
      isPlaying: this.isPlaying,
      currentBeat: Math.floor(this.currentSubBeat / 2),
      currentBar: Math.floor(this.currentSubBeat / ((this.track?.timeSignature[0] || 4) * 2)) + 1,
      totalBeats: this.calculateTotalBeats(),
      tempo: this.tempo
    };
  }

  private calculateTotalBeats(): number {
    if (!this.track) return 0;
    return this.track.progression.reduce((acc, chord) => acc + chord.duration, 0);
  }

  /**
   * Sets the playback tempo.
   * @param bpm - Beats per minute (40-240).
   */
  public setTempo(bpm: number) {
    if (bpm < 40 || bpm > 240) throw new Error('Tempo must be between 40 and 240 BPM');
    this.tempo = bpm;
  }

  /**
   * Loads a backing track and resets the sub-beat counter.
   */
  public loadTrack(track: BackingTrack) {
    if (!track.progression || track.progression.length === 0) throw new Error('Empty progression');
    this.track = track;
    this.tempo = track.tempo;
    this.currentSubBeat = 0;
  }

  /**
   * Starts the playback loop.
   */
  public async start() {
    this.initAudio();
    if (this.audioCtx?.state === 'suspended') await this.audioCtx.resume();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextNoteTime = this.audioCtx!.currentTime;
    this.scheduler();
  }

  /**
   * Stops the playback and clears timers.
   */
  public stop() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID as any);
    this.currentSubBeat = 0;
  }

  /**
   * The core scheduling loop. Uses the Look-ahead pattern.
   */
  private scheduler() {
    if (!this.isPlaying || !this.audioCtx) return;
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleSubBeat(this.currentSubBeat, this.nextNoteTime);
      this.nextSubBeat();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookAhead) as any;
  }

  /**
   * Increments the sequencer by one 8th note.
   */
  private nextSubBeat() {
    const secondsPerSubBeat = 30.0 / this.tempo;
    this.nextNoteTime += secondsPerSubBeat;
    const totalSubBeats = this.calculateTotalBeats() * 2;
    this.currentSubBeat = (this.currentSubBeat + 1) % totalSubBeats;
  }

  /**
   * Genre-specific rhythm engine.
   * Resolves the current chord, transposes it, and triggers instruments
   * based on the current sub-beat and style.
   */
  private scheduleSubBeat(subBeat: number, time: number) {
    if (!this.audioCtx || !this.track) return;

    const subBeatsPerBar = (this.track.timeSignature[0] || 4) * 2;
    const barSubBeat = subBeat % subBeatsPerBar;
    const beat = Math.floor(subBeat / 2);
    
    // Find chord
    let acc = 0;
    let currentChord = this.track.progression[0];
    for (const c of this.track.progression) {
      if (beat < acc + c.duration) { currentChord = c; break; }
      acc += c.duration;
    }

    // Transpose
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const trackKeyIdx = notes.indexOf(this.track.key.toUpperCase().replace('S', '#'));
    const targetKeyIdx = notes.indexOf(this.targetKey.toUpperCase().replace('S', '#'));
    const chordRootIdx = notes.indexOf(currentChord.root.toUpperCase().replace('S', '#'));
    const interval = (targetKeyIdx - trackKeyIdx + 12) % 12;
    const root = notes[(chordRootIdx + interval) % 12];

    // --- GENRE LOGIC ---
    if (this.track.style === 'rock') {
      // DRUMS: Driving 8th note rock
      if (barSubBeat === 0 || barSubBeat === 4 || barSubBeat === 5) this.playKick(time);
      if (barSubBeat === 2 || barSubBeat === 6) this.playSnare(time);
      this.playHiHat(time, barSubBeat % 2 === 0 ? 0.8 : 0.4);

      // RHYTHM: Eighth-note chugging power chords
      const isDownbeat = barSubBeat % 4 === 0;
      const velocity = isDownbeat ? 1.0 : 0.6;
      const duration = isDownbeat ? 0.4 : 0.15; // Palm mute on off-beats
      this.playChord(root, currentChord.quality, time, velocity, duration);

      // BASS: Eighth notes following the root
      this.playBass(root, time, isDownbeat ? 0.8 : 0.5);
    } 
    else if (this.track.style === 'blues') {
      // Shuffle feel (swinging the 8ths is hard without 16ths, but we'll accent)
      if (barSubBeat === 0 || barSubBeat === 4) this.playKick(time);
      if (barSubBeat === 2 || barSubBeat === 6) this.playSnare(time, 0.4);
      if (barSubBeat % 2 === 0) this.playHiHat(time, 0.6);

      // Chords on every beat
      if (subBeat % 2 === 0) this.playChord(root, currentChord.quality, time, 0.7, 0.8);
      // Bass on every beat
      if (subBeat % 2 === 0) this.playBass(root, time, 0.7);
    }
    else {
      // Funk/Soul default
      if (barSubBeat === 0) this.playKick(time);
      if (barSubBeat === 4) this.playSnare(time);
      if (barSubBeat % 2 === 0) this.playHiHat(time, 0.3);
      if (barSubBeat === 0) this.playChord(root, currentChord.quality, time, 0.6, 2.0);
      if (subBeat % 2 === 0) this.playBass(root, time, 0.6);
    }
  }

  // --- INSTRUMENTS ---

  /**
   * Synthesizes a kick drum thump using a frequency sweep.
   */
  private playKick(time: number) {
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(gain); gain.connect(this.audioCtx!.destination);
    osc.start(time); osc.stop(time + 0.1);
  }

  /**
   * Synthesizes a snare drum crack using white noise and a high-pass filter.
   */
  private playSnare(time: number, vol = 1.0) {
    const buffer = this.audioCtx!.createBuffer(1, this.audioCtx!.sampleRate * 0.1, this.audioCtx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.audioCtx!.createBufferSource(); noise.buffer = buffer;
    const filter = this.audioCtx!.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1000;
    const gain = this.audioCtx!.createGain(); gain.gain.setValueAtTime(0.2 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    noise.connect(filter); filter.connect(gain); gain.connect(this.audioCtx!.destination);
    noise.start(time); noise.stop(time + 0.1);
  }

  /**
   * Synthesizes a hi-hat "tick" using a square wave and extreme high-pass filtering.
   */
  private playHiHat(time: number, vol = 0.5) {
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(10000, time);
    const filter = this.audioCtx!.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 7000;
    gain.gain.setValueAtTime(0.05 * vol, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    osc.connect(filter); filter.connect(gain); gain.connect(this.audioCtx!.destination);
    osc.start(time); osc.stop(time + 0.05);
  }

  /**
   * Synthesizes a bass note using a triangle wave in the low register.
   */
  private playBass(root: string, time: number, vol = 0.3) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const idx = notes.indexOf(root.toUpperCase().replace('S', '#'));
    if (idx === -1) return;
    const freq = 440 * Math.pow(2, (24 + idx - 69) / 12);
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    osc.connect(gain); gain.connect(this.audioCtx!.destination);
    osc.start(time); osc.stop(time + 0.4);
  }

  /**
   * Synthesizes rhythm chords.
   * Uses polyphonic oscillators. For power chords, applies a distortion chain.
   */
  private playChord(root: string, quality: string, time: number, vol = 0.5, duration = 1.0) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const idx = notes.indexOf(root.toUpperCase().replace('S', '#'));
    if (idx === -1) return;
    const baseMidi = 48 + idx;
    let intervals = [0, 4, 7];
    if (quality === 'minor' || quality === 'm' || quality === 'm7') intervals = [0, 3, 7];
    if (quality === '7') intervals = [0, 4, 7, 10];
    if (quality === 'maj7') intervals = [0, 4, 7, 11];
    if (quality === 'power') intervals = [0, 7, 12];

    intervals.forEach(interval => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      const isPower = quality === 'power';
      osc.type = isPower ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(440 * Math.pow(2, (baseMidi + interval - 69) / 12), time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(isPower ? vol * 0.2 : vol * 0.1, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      if (isPower) {
        const dist = this.audioCtx!.createWaveShaper(); dist.curve = this.makeDistortionCurve(50);
        const filter = this.audioCtx!.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2500;
        osc.connect(dist); dist.connect(filter); filter.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(this.audioCtx!.destination);
      osc.start(time); osc.stop(time + duration);
    });
  }

  public async playNoodle() {
    this.initAudio();
    if (this.audioCtx?.state === 'suspended') await this.audioCtx.resume();
    if (!this.track?.noodleSample || !this.audioCtx) return;
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const targetKeyIdx = notes.indexOf(this.targetKey.toUpperCase().replace('S', '#'));
    const baseMidi = 48 + (targetKeyIdx === -1 ? 9 : targetKeyIdx); 
    const secondsPerBeat = 60.0 / this.tempo;
    const now = this.audioCtx.currentTime;
    let acc = 0;
    this.track.noodleSample.forEach((item, index) => {
      const durSec = item.duration * secondsPerBeat;
      if (item.note !== null) {
        const jitter = index === 0 ? 0 : (Math.random() * 0.03 - 0.015);
        this.playGuitarNote(baseMidi + item.note, now + acc + jitter, durSec * 0.95, item.velocity || 0.8, item.articulation, item.bendAmount);
      }
      acc += durSec;
    });
  }

  private generateStringBuffer(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.audioCtx!.sampleRate;
    const N = Math.round(sampleRate / frequency);
    const buffer = this.audioCtx!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < N; i++) data[i] = Math.random() * 2 - 1;
    const decay = this.audioPreset === 'clean' ? 0.998 : 0.995;
    for (let i = N; i < data.length; i++) {
      data[i] = 0.5 * (data[i - N] + (i - N - 1 >= 0 ? data[i - N - 1] : 0)) * decay;
    }
    return buffer;
  }

  private playGuitarNote(midi: number, time: number, duration: number, velocity: number, articulation?: any, bendAmount = 0) {
    if (!this.audioCtx) return;

    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const cacheKey = Math.round(freq * 100);
    let buf = this.bufferCache.get(cacheKey);
    if (!buf) { buf = this.generateStringBuffer(freq, 3.0); this.bufferCache.set(cacheKey, buf); }
    
    const source = this.audioCtx.createBufferSource(); 
    source.buffer = buf;

    // Pitch Modulation (Bends/Slides)
    if (articulation === 'bend' && bendAmount !== 0) {
      source.playbackRate.setValueAtTime(1.0, time);
      source.playbackRate.exponentialRampToValueAtTime(Math.pow(2, bendAmount / 12), time + 0.3);
    } else if (articulation === 'slide') {
      source.playbackRate.setValueAtTime(Math.pow(2, -2 / 12), time);
      source.playbackRate.linearRampToValueAtTime(1.0, time + 0.15);
    }

    // --- 1. PRE-AMP (Gain & Dynamics) ---
    const preAmpGain = this.audioCtx.createGain();
    const isLegato = articulation === 'hammer' || articulation === 'pull';
    // Scale attack by velocity. Harder = faster/louder.
    const attackLevel = isLegato ? velocity * 0.7 : velocity;
    const attackTime = isLegato ? 0.05 : (0.01 / (velocity + 0.1)); // Protect against div/0

    preAmpGain.gain.setValueAtTime(0, time);
    preAmpGain.gain.linearRampToValueAtTime(attackLevel * 2.0, time + attackTime); // Boost into distortion
    preAmpGain.gain.exponentialRampToValueAtTime(0.01, time + duration + 1.5);

    // --- 2. DISTORTION (The Amp) ---
    const dist = this.audioCtx.createWaveShaper(); 
    dist.curve = this.makeDistortionCurve(this.audioPreset === 'clean' ? 5 : 100);
    dist.oversample = '4x';

    // --- 3. TONESTACK (EQ) ---
    // Marshall Mid-Hump
    const midBoost = this.audioCtx.createBiquadFilter();
    midBoost.type = 'peaking';
    midBoost.frequency.setValueAtTime(800, time);
    midBoost.Q.value = 1.0;
    midBoost.gain.value = 6;

    // --- 4. CABINET SIMULATION ---
    // 4th Order Filter Chain to remove digital fizz
    const cabLP1 = this.audioCtx.createBiquadFilter();
    cabLP1.type = 'lowpass'; cabLP1.frequency.setValueAtTime(3500, time);
    
    const cabLP2 = this.audioCtx.createBiquadFilter();
    cabLP2.type = 'lowpass'; cabLP2.frequency.setValueAtTime(3500, time);

    const cabHP = this.audioCtx.createBiquadFilter();
    cabHP.type = 'highpass'; cabHP.frequency.setValueAtTime(100, time);

    // --- 5. MASTER & EFFECTS ---
    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = this.audioPreset === 'clean' ? 0.4 : 0.15; // Compensate for high gain

    // Routing
    source.connect(preAmpGain);
    preAmpGain.connect(dist);
    dist.connect(midBoost);
    midBoost.connect(cabHP);
    cabHP.connect(cabLP1);
    cabLP1.connect(cabLP2);

    // Delay for 'Dreamy'
    if (this.audioPreset === 'dreamy') {
      const delay = this.audioCtx.createDelay();
      delay.delayTime.value = 0.35;
      const delayFb = this.audioCtx.createGain();
      delayFb.gain.value = 0.4;
      const delayFilter = this.audioCtx.createBiquadFilter();
      delayFilter.type = 'lowpass'; delayFilter.frequency.value = 2000;

      cabLP2.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(delayFb);
      delayFb.connect(delay);
      delayFilter.connect(masterGain);
      cabLP2.connect(masterGain);
    } else {
      cabLP2.connect(masterGain);
    }

    masterGain.connect(this.audioCtx.destination);
    
    source.start(time); 
    source.stop(time + duration + 2.0);
  }

  private makeDistortionCurve(amount: number) {
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1 + 0.05;
      if (x > 0) curve[i] = (2 / Math.PI) * Math.atan(x * amount);
      else curve[i] = (x * 1.5) / (1 + Math.abs(x) * (amount / 2));
    }
    return curve;
  }
}