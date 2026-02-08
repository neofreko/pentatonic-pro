
import { BackingTrack, SequencerState } from '../types';

/**

 * Service class responsible for scheduling and synthesizing backing tracks.

 * 

 * Features:

 * - Precision scheduling using the "Look-ahead" pattern (Web Audio API).

 * - Polyphonic sequencing for Drums, Bass, and Harmony.

 * - Karplus-Strong physical modeling for realistic guitar string synthesis.

 * - JCM 800-inspired Amplifier and Cabinet simulation.

 * - Real-time transposition and tempo adjustment.

 */

export class BackingTrackService {

  private audioCtx: AudioContext | null = null;

  private track: BackingTrack | null = null;

  private targetKey: string = 'A';

  private isPlaying: boolean = false;

  

  // Scheduling state

  private currentBeat: number = 0;

  private tempo: number = 120;

  private nextNoteTime: number = 0;

    private timerID: number | null = null;

    

    // AudioBuffer cache: Map<Frequency, AudioBuffer>

    private bufferCache: Map<number, AudioBuffer> = new Map();

    

    // Scheduler tuning

  

  private lookAhead: number = 25.0; // ms to sleep between scheduling checks

  private scheduleAheadTime: number = 0.1; // seconds to schedule into the future

  

  private audioPreset: 'clean' | 'crunch' | 'dreamy' = 'clean';



  constructor() {}



  /**

   * Initializes the AudioContext if it doesn't exist.

   * Must be called after a user interaction to unlock audio in browsers.

   */

  private initAudio() {

    if (!this.audioCtx) {

      this.audioCtx = new AudioContext();

    }

  }



  /**

   * Sets the global audio preset affecting the guitar tone.

   * @param preset - 'clean' (Sparkly), 'crunch' (JCM800), or 'dreamy' (Ambient Delay)

   */

    public setAudioPreset(preset: 'clean' | 'crunch' | 'dreamy') {

      if (this.audioPreset !== preset) {

        this.audioPreset = preset;

        this.bufferCache.clear(); // Recalculate strings for new tone

        console.log(`[BackingTrackService] Audio preset set to ${preset} (Cache cleared)`);

      }

    }

  



  /**

   * Sets the target key for transposition. All chords and melodies will be

   * shifted relative to the track's original key.

   * @param key - The new root note (e.g., 'G', 'F#')

   */

  public setTargetKey(key: string) {

    this.targetKey = key;

    console.log(`[BackingTrackService] Target key set to ${key}`);

  }



  /**

   * Returns the current state of the sequencer for UI updates.

   */

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



  /**

   * Loads a backing track and resets the sequencer.

   * @param track - The BackingTrack object containing progression and metadata.

   */

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



  /**

   * Starts the sequencer. Resumes AudioContext if suspended.

   */

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



  /**

   * Plays the "Noodle Sample" melody using the Karplus-Strong guitar synth.

   * Adapts to the current key and audio preset.

   */

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

    const secondsPerBeat = 60.0 / this.tempo;

    

    const now = this.audioCtx.currentTime;

    let accumulatedTime = 0;



            this.track.noodleSample.forEach((item, index) => {



              const durationSec = item.duration * secondsPerBeat;



              if (item.note !== null) {



                const playDuration = durationSec * 0.95; 



                



                // Humanization: Micro-timing (Groove)



                // Add random jitter +/- 15ms, but keep the first note tight



                const jitter = index === 0 ? 0 : (Math.random() * 0.03 - 0.015);



                const startTime = now + accumulatedTime + jitter;



        



                        console.log(`[Sequencer] Scheduling note ${index}: midi=${baseMidi + item.note}, start=${startTime.toFixed(2)}, dur=${playDuration.toFixed(2)}`);



        



                        



        



                        this.playGuitarNote(



        



                          baseMidi + item.note, 



        



                          startTime, 



        



                          playDuration, 



        



                          item.velocity || 0.8,



        



                          item.articulation,



        



                          item.bendAmount



        



                        );



        



                      }



        



                      accumulatedTime += durationSec;



        



                    });



        



                



            console.log(`[Sequencer] Total phrase duration: ${accumulatedTime.toFixed(2)} seconds`);



          }



        



    



  /**

   * Generates a Karplus-Strong string buffer.

   * This physically models a plucked string by looping noise through a low-pass delay line.

   * 

   * @param frequency - The fundamental frequency of the note.

   * @param duration - Length of the buffer in seconds.

   * @returns An AudioBuffer containing the generated string sound.

   */

  private generateStringBuffer(frequency: number, duration: number): AudioBuffer {

    if (!this.audioCtx) throw new Error('No Audio Context');



    const sampleRate = this.audioCtx.sampleRate;

    // Calculate period (length of the string in samples)

    const N = Math.round(sampleRate / frequency);

    

    // Total duration samples

    const length = sampleRate * duration;

    const buffer = this.audioCtx.createBuffer(1, length, sampleRate);

    const data = buffer.getChannelData(0);



    // 1. "Excite" the string (The Pick)

    // Fill the first period (N samples) with white noise

    for (let i = 0; i < N; i++) {

      data[i] = Math.random() * 2 - 1;

    }



                // 2. String Decay (The Vibration)
                // Loop through the rest of the buffer, averaging previous samples (Low Pass Filter)
                const decay = this.audioPreset === 'clean' ? 0.998 : 0.995;
                
                for (let i = N; i < length; i++) {
                  const val = 0.5 * (data[i - N] + (i - N - 1 >= 0 ? data[i - N - 1] : 0));
                  data[i] = val * decay;
                }
                  

      



    return buffer;

  }



  /**

   * Synthesizes a guitar note using physical modeling (Karplus-Strong) fed into

   * a simulated amplifier chain (Pre-Amp -> Distortion -> Cabinet -> Effects).

   * 

         * @param duration - Duration of the note in seconds.

         * @param velocity - 0.0 to 1.0, controls volume and attack bite.

         * @param articulation - Type of expression (bend, slide, hammer).

         * @param bendAmount - Pitch change in semitones.

         */

        private playGuitarNote(

          midi: number, 

          time: number, 

          duration: number = 0.8, 

          velocity: number = 0.8,

          articulation?: 'bend' | 'slide' | 'hammer' | 'pull',

          bendAmount: number = 0

        ) {

          if (!this.audioCtx) return;

      

          const freq = 440 * Math.pow(2, (midi - 69) / 12);

          

          // Check cache (we might want to vary this by velocity later, but for now cache pitch)

          const cacheKey = Math.round(freq * 100); 

          let stringBuffer = this.bufferCache.get(cacheKey);

          

          if (!stringBuffer) {

            stringBuffer = this.generateStringBuffer(freq, 3.0);

            this.bufferCache.set(cacheKey, stringBuffer);

          }

          

          const source = this.audioCtx.createBufferSource();

          source.buffer = stringBuffer;

      

          // --- ARTICULATION: PITCH MODULATION ---

          if (articulation === 'bend' && bendAmount !== 0) {

            // Start at pitch, bend UP to target

            source.playbackRate.setValueAtTime(1.0, time);

            const targetRate = Math.pow(2, bendAmount / 12);

            // Fast bend or slow bend? Let's do a bluesy slow bend (0.3s)

            source.playbackRate.exponentialRampToValueAtTime(targetRate, time + 0.3);

          } else if (articulation === 'slide') {

            // Slide INTO the note from 2 semitones below

            const startRate = Math.pow(2, -2 / 12);

            source.playbackRate.setValueAtTime(startRate, time);

            source.playbackRate.linearRampToValueAtTime(1.0, time + 0.15); // Fast slide

          }

      

          // --- 2. PRE-AMP (Gain Stage) ---

          // Velocity scales the input gain

          const preAmpGain = this.audioCtx.createGain();

          

          // For Hammer/Pull, we want a softer attack to simulate finger noise without picking

          const isLegato = articulation === 'hammer' || articulation === 'pull';

          const attackLevel = 1.0 * (isLegato ? velocity * 0.7 : velocity); 

          const attackTime = isLegato ? 0.05 : (0.01 / velocity); // Slower attack for legato

      

          preAmpGain.gain.setValueAtTime(0, time);

          preAmpGain.gain.linearRampToValueAtTime(attackLevel, time + attackTime); 

          preAmpGain.gain.exponentialRampToValueAtTime(0.01, time + duration + 1.5); 

      

          source.connect(preAmpGain);

      

   
    

    // --- 3. DISTORTION STAGE ---

    const distGain = this.audioCtx.createGain();

    // Drive the distortion harder for crunch/dreamy

    distGain.gain.value = this.audioPreset === 'clean' ? 1.5 : 50; 



    const distortion = this.audioCtx.createWaveShaper();

    distortion.curve = this.makeDistortionCurve(this.audioPreset === 'clean' ? 5 : 200);

    distortion.oversample = '4x';



    preAmpGain.connect(distGain);

    distGain.connect(distortion);



    // --- 4. TONESTACK & CABINET ---

    // Marshall-style EQ to shape the distorted signal

    const midBoost = this.audioCtx.createBiquadFilter();

    midBoost.type = 'peaking';

    midBoost.frequency.setValueAtTime(800, time);

    midBoost.Q.value = 1.0;

    midBoost.gain.value = 6;



    const cabLP = this.audioCtx.createBiquadFilter();

    cabLP.type = 'lowpass';

    cabLP.frequency.setValueAtTime(3500, time); // Speaker rolloff



    const cabHP = this.audioCtx.createBiquadFilter();

    cabHP.type = 'highpass';

    cabHP.frequency.setValueAtTime(100, time); // Remove sub-rumble



    distortion.connect(midBoost);

    midBoost.connect(cabHP);

    cabHP.connect(cabLP);



    // --- 5. MASTER & EFFECTS ---

    const masterGain = this.audioCtx.createGain();

    // Compensate for the massive gain in distortion stage

    masterGain.gain.value = this.audioPreset === 'clean' ? 0.4 : 0.05;



    // Basic Delay for 'Dreamy'

    if (this.audioPreset === 'dreamy') {

      const delay = this.audioCtx.createDelay();

      delay.delayTime.value = 0.35;

      const delayFeedback = this.audioCtx.createGain();

      delayFeedback.gain.value = 0.4;

      

      cabLP.connect(delay);

      delay.connect(delayFeedback);

      delayFeedback.connect(delay);

      delay.connect(masterGain);

      cabLP.connect(masterGain);

    } else {

      cabLP.connect(masterGain);

    }



    masterGain.connect(this.audioCtx.destination);

    source.start(time);
    source.stop(time + duration + 2.0);
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



  /**

   * The core scheduling loop.

   * Checks for notes that need to be played in the next `scheduleAheadTime` window.

   */

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



  /**

   * Creates a sigmoid distortion curve for the WaveShaperNode.

   * Can be configured for soft clipping (low amounts) or hard fuzz (high amounts).

   */

  private makeDistortionCurve(amount: number) {

    const n_samples = 44100;

    const curve = new Float32Array(n_samples);

    const k = amount;

    for (let i = 0; i < n_samples; ++i) {

      const x = (i * 2) / n_samples - 1;

      // Asymmetric soft clipping: different curve for positive and negative

      // This mimics how real tube circuits are biased

      const xBiased = x + 0.05; 

      if (xBiased > 0) {

        curve[i] = (2 / Math.PI) * Math.atan(xBiased * k);

      } else {

        curve[i] = (xBiased * 1.5) / (1 + Math.abs(xBiased) * (k / 2));

      }

    }

    return curve;

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
