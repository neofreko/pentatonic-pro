
export type ScaleType = 'minor' | 'major' | 'chromatic';

export interface Note {
  name: string;
  value: number; // 0-11
}

export interface FretPosition {
  string: number; // 0-5 (High E to Low E)
  fret: number;
}

export interface PracticeRoutine {
  title: string;
  description: string;
  steps: string[];
}

export interface Challenge {
  type: 'FIND_INTERVALS' | 'SEQUENCE_RECALL';
  targetInterval: string;
  description: string;
  requiredCount: number;
}

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  targetInterval?: string; // If set, user must click this to proceed
  actionText: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  targetScaleType: ScaleType;
  focus: string;
  mission: string;
  challenge: Challenge;
  tutorialSteps: TutorialStep[];
}

// New types for position data
export type StringFretOffsets = [number, number[]]; // [StringIndex, [FretOffsets]]
export type PositionMap = Record<number, StringFretOffsets[]>;
export type ScalePositionData = Record<ScaleType, PositionMap>;

export type ChordQuality = 'major' | 'minor' | '7' | 'maj7' | 'm7' | 'dim' | 'aug' | 'sus4' | '7sus4' | 'power';

export interface BackingTrackChord {
  root: string; // e.g., 'C', 'F#'
  quality: ChordQuality;
  duration: number; // Duration in beats (e.g., 4 for a full bar in 4/4)
}

export interface MelodyNote {
  note: number | null; // MIDI offset relative to root. null for rest.
  duration: number; // Duration in beats (e.g., 0.5 for eighth note)
  velocity?: number; // 0.0 to 1.0 (default 0.8). Controls attack and volume.
  articulation?: 'bend' | 'slide' | 'hammer' | 'pull';
  bendAmount?: number; // Semitones to bend (e.g., 1, 2, or 0.5 for microtonal)
}

export interface BackingTrack {
  id: string;
  name: string;
  description: string;
  key: string; // The base key, e.g., 'C'
  mode: 'major' | 'minor' | 'blues';
  tempo: number; // BPM (Valid range: 40-240)
  timeSignature: [number, number]; // e.g., [4, 4] or [3, 4]
  progression: BackingTrackChord[];
  style: 'rock' | 'jazz' | 'blues' | 'funk';
  noodleSample?: MelodyNote[]; // Structured melody with timing
}

export interface SequencerState {
  isPlaying: boolean;
  currentBeat: number;
  currentBar: number;
  totalBeats: number;
  tempo: number;
}
