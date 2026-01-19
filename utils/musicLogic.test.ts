import { describe, it, expect } from 'vitest';
import { getNoteAtPosition, isNoteInScale, getIntervalName } from './musicLogic';

describe('musicLogic', () => {
    describe('getNoteAtPosition', () => {
        it('should return correct notes for standard tuning (String 0 is High E)', () => {
            expect(getNoteAtPosition(0, 0)).toBe('E');
            expect(getNoteAtPosition(5, 0)).toBe('E');
            expect(getNoteAtPosition(5, 5)).toBe('A');
            expect(getNoteAtPosition(1, 1)).toBe('C');
        });
    });

    describe('isNoteInScale', () => {
        it('should return true if note is in the pentatonic major scale', () => {
            expect(isNoteInScale('C', 'C', 'major')).toBe(true);
            expect(isNoteInScale('D', 'C', 'major')).toBe(true);
            expect(isNoteInScale('E', 'C', 'major')).toBe(true);
            // F is NOT in C major pentatonic (C, D, E, G, A)
            expect(isNoteInScale('G', 'C', 'major')).toBe(true);
            expect(isNoteInScale('A', 'C', 'major')).toBe(true);
        });

        it('should return false if note is not in the pentatonic major scale', () => {
            expect(isNoteInScale('C#', 'C', 'major')).toBe(false);
            expect(isNoteInScale('F', 'C', 'major')).toBe(false);
            expect(isNoteInScale('B', 'C', 'major')).toBe(false);
        });
    });

    describe('getIntervalName', () => {
        it('should return "R" for the root note', () => {
            expect(getIntervalName('C', 'C', 'major')).toBe('R');
        });

        it('should return correct intervals for C major', () => {
            expect(getIntervalName('D', 'C', 'major')).toBe('2');
            expect(getIntervalName('E', 'C', 'major')).toBe('3');
            expect(getIntervalName('G', 'C', 'major')).toBe('5');
        });
    });
});
