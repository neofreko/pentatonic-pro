import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePentatonicScale } from './usePentatonicScale';

describe('usePentatonicScale', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePentatonicScale());
        expect(result.current.rootNote).toBe('A');
        expect(result.current.scaleType).toBe('minor');
        expect(result.current.currentPosition).toBe(1);
    });

    it('should update root note', () => {
        const { result } = renderHook(() => usePentatonicScale());
        act(() => {
            result.current.setRootNote('C');
        });
        expect(result.current.rootNote).toBe('C');
    });

    it('should calculate note IDs based on position', () => {
        const { result } = renderHook(() => usePentatonicScale('A', 'minor'));
        // Position 1 of A minor pentatonic should contain 5-5 (A)
        expect(result.current.currentPositionNoteIds.has('5-5')).toBe(true);
    });
});
