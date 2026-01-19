import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSequencePlayer } from './useSequencePlayer';

// Mock playNote to avoid audio issues in tests
vi.mock('../utils/audio', () => ({
    playNote: vi.fn(),
}));

describe('useSequencePlayer', () => {
    const mockNoteIds = new Set(['5-5', '5-8', '4-5']); // A, C, D

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useSequencePlayer(mockNoteIds));
        expect(result.current.currentStepIndex).toBe(-1);
        expect(result.current.isPlayingScale).toBe(false);
        expect(result.current.activeNoteId).toBe(null);
    });

    it('should calculate full sequence (triplets)', () => {
        const { result } = renderHook(() => useSequencePlayer(mockNoteIds));
        // With 3 notes, we should have 1 triplet (3 steps)
        expect(result.current.fullSequence.length).toBe(3);
        expect(result.current.fullSequence[0].tripletIdx).toBe(1);
    });

    it('should navigate forward and backward', () => {
        const { result } = renderHook(() => useSequencePlayer(mockNoteIds));

        act(() => {
            result.current.stepForward();
        });
        expect(result.current.currentStepIndex).toBe(0);
        expect(result.current.activeNoteId).toBe('5-5');

        act(() => {
            result.current.stepForward();
        });
        expect(result.current.currentStepIndex).toBe(1);

        act(() => {
            result.current.stepBackward();
        });
        expect(result.current.currentStepIndex).toBe(0);
    });

    it('should reset sequence', () => {
        const { result } = renderHook(() => useSequencePlayer(mockNoteIds));
        act(() => {
            result.current.stepForward();
            result.current.resetSequence();
        });
        expect(result.current.currentStepIndex).toBe(-1);
        expect(result.current.activeNoteId).toBe(null);
    });
});
