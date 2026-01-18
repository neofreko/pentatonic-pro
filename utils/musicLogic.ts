
import { NOTES, TUNING, SCALE_INTERVALS } from '../constants';
import { ScaleType } from '../types';

export const getNoteAtPosition = (stringIndex: number, fret: number): string => {
  const openNoteIndex = TUNING[stringIndex];
  const noteIndex = (openNoteIndex + fret) % 12;
  return NOTES[noteIndex];
};

export const isNoteInScale = (noteName: string, rootNote: string, scaleType: ScaleType): boolean => {
  const rootIndex = NOTES.indexOf(rootNote);
  const noteIndex = NOTES.indexOf(noteName);
  const relativeInterval = (noteIndex - rootIndex + 12) % 12;
  return SCALE_INTERVALS[scaleType].includes(relativeInterval);
};

export const getIntervalName = (noteName: string, rootNote: string, scaleType: ScaleType): string => {
  const rootIndex = NOTES.indexOf(rootNote);
  const noteIndex = NOTES.indexOf(noteName);
  const diff = (noteIndex - rootIndex + 12) % 12;

  if (scaleType === 'minor') {
    switch (diff) {
      case 0: return 'R';
      case 3: return 'b3';
      case 5: return '4';
      case 7: return '5';
      case 10: return 'b7';
      default: return '';
    }
  } else {
    switch (diff) {
      case 0: return 'R';
      case 2: return '2';
      case 4: return '3';
      case 7: return '5';
      case 9: return '6';
      default: return '';
    }
  }
};
