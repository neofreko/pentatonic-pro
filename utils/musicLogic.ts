
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
  const intervals = (SCALE_INTERVALS as any)[scaleType];
  if (!intervals) return false;
  return intervals.includes(relativeInterval);
};

export const getIntervalName = (noteName: string, rootNote: string, _scaleType: ScaleType): string => {
  const rootIndex = NOTES.indexOf(rootNote);
  const noteIndex = NOTES.indexOf(noteName);
  const diff = (noteIndex - rootIndex + 12) % 12;

  const intervalMap: Record<number, string> = {
    0: 'R',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: 'b6',
    9: '6',
    10: 'b7',
    11: '7'
  };

  return intervalMap[diff] || '';
};
