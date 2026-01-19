
export type ScaleType = 'minor' | 'major';

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
