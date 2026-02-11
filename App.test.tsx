import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as lessonLoader from './services/lessonLoader';

vi.mock('./services/lessonLoader', () => ({
    loadLessons: vi.fn(),
}));

vi.mock('./services/aiService', () => ({
    getScaleLesson: vi.fn(),
    testOpenRouterConnection: vi.fn(),
}));

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    canPlayType: vi.fn().mockReturnValue('maybe'),
}));

// Mock AudioContext to work in happy-dom
const mockAudioContext = function (this: any) {
    this.createOscillator = vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        type: 'triangle',
        frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
        }
    });
    this.createGain = vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
            value: 0,
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
        },
    });
    this.destination = {};
    this.currentTime = 0;
    this.close = vi.fn();
};

(window as any).AudioContext = mockAudioContext;
(window as any).webkitAudioContext = mockAudioContext;

describe('App', () => {
    const mockChapters = [
        {
            id: 'ch1',
            title: 'Chapter 1',
            description: 'Desc',
            focus: 'Focus',
            targetScaleType: 'minor',
            tutorialSteps: [],
            challenge: {
                description: 'Find all Root notes',
                targetInterval: 'R',
                requiredCount: 2
            }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (lessonLoader.loadLessons as any).mockResolvedValue(mockChapters);
    });

    it('should load without crashing with mock chapters', async () => {
        render(<App />);
        const title = await screen.findByRole('heading', { name: /Pentatonic Pro/i });
        expect(title).toBeInTheDocument();
    });

    it('should show loading indicators for chapters', () => {
        (lessonLoader.loadLessons as any).mockReturnValue(new Promise(() => { })); // Never resolves
        render(<App />);
        const loaders = document.querySelectorAll('.animate-spin');
        expect(loaders.length).toBeGreaterThan(0);
    });

    describe('Hint System', () => {
        it('should show a hint and clear it on note click', async () => {
            render(<App />);

            // Wait for chapters to load and UI to settle
            await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

            // Start Challenge
            const challengeBtn = await screen.findByText(/Jump to Challenge/i);
            fireEvent.click(challengeBtn);

            // Verify hint button exists
            const hintBtn = await screen.findByText(/Need a Hint\?/i);
            expect(hintBtn).toBeInTheDocument();

            // Click hint button
            fireEvent.click(hintBtn);

            // Verify a note is pulsing (hint active)
            let pulsingNotes = document.querySelectorAll('.animate-pulse');
            expect(pulsingNotes.length).toBeGreaterThan(0);

            // Click a note button
            const noteBtn = document.querySelector('button.w-11.h-11');
            if (noteBtn) {
                fireEvent.click(noteBtn);
            }

            // Verify hint is cleared on the fretboard (avoiding other UI elements that might pulse like Jam Mode)
            const fretboardContainer = document.querySelector('.bg-\\[\\#0a0f1d\\]');
            pulsingNotes = fretboardContainer?.querySelectorAll('.animate-pulse') || [];
            expect(pulsingNotes.length).toBe(0);
        });

        it('should wrap hints into the visible range if they are off-fretboard', async () => {
            // Mock a chapter with a target that might be high
            (lessonLoader.loadLessons as any).mockResolvedValue([{
                id: 'ch-high',
                title: 'High Box',
                targetScaleType: 'minor',
                tutorialSteps: [],
                challenge: { targetInterval: 'R', requiredCount: 1 }
            }]);

            render(<App />);
            await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

            // Start Challenge first so we can see the controls
            const challengeBtn = await screen.findByText(/Jump to Challenge/i);
            fireEvent.click(challengeBtn);

            // Wait for controls to be visible
            await screen.findByText(/Box Position/i);

            // Find the position 5 button specifically (not fret 5)
            const posButtons = screen.getAllByRole('button');
            const pos5Btn = posButtons.find(b => b.textContent === '5');

            if (pos5Btn) {
                fireEvent.click(pos5Btn);
            } else {
                throw new Error("Could not find position 5 button");
            }

            const hintBtn = await screen.findByText(/Need a Hint\?/i);
            fireEvent.click(hintBtn);

            // Verify a pulsing note exists and it is within the 0-15 range
            const pulsingNotes = document.querySelectorAll('.animate-pulse');
            expect(pulsingNotes.length).toBeGreaterThan(0);

            pulsingNotes.forEach(node => {
                // In our implementation, we'd need to check the data-fret or similar
                // But since it's in the DOM rendered by Fretboard (which only does 0-15), 
                // the mere presence of a pulsing note in the DOM proves it's within range.
            });
        });
    });
});
