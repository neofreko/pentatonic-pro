import { useState, useMemo, useCallback } from 'react';
import { MIDI_TUNING } from '../constants';
import { playNote } from '../utils/audio';

export const useSequencePlayer = (currentPositionNoteIds: Set<string>) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlayingScale, setIsPlayingScale] = useState(false);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

    const fullSequence = useMemo(() => {
        const notesInBox = Array.from(currentPositionNoteIds).map((id: string) => {
            const [s, f] = id.split('-').map(Number);
            return { s, f, midi: MIDI_TUNING[s] + f };
        }).sort((a, b) => a.midi - b.midi);

        if (notesInBox.length < 3) return [];

        const sequence: { s: number, f: number, midi: number, pair: number[], tripletIdx: number }[] = [];
        for (let i = 0; i < notesInBox.length - 2; i++) {
            const triplet = [notesInBox[i], notesInBox[i + 1], notesInBox[i + 2]];
            const activeStrings = Array.from(new Set(triplet.map(n => n.s)));
            triplet.forEach((note, idx) => {
                sequence.push({
                    ...note,
                    pair: activeStrings,
                    tripletIdx: idx + 1
                });
            });
        }
        return sequence;
    }, [currentPositionNoteIds]);

    const resetSequence = useCallback(() => {
        setCurrentStepIndex(-1);
        setActiveNoteId(null);
    }, []);

    const stepForward = useCallback(() => {
        if (currentStepIndex < fullSequence.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            const note = fullSequence[nextIdx];
            setActiveNoteId(`${note.s}-${note.f}`);
            playNote(note.midi);
        }
    }, [currentStepIndex, fullSequence]);

    const stepBackward = useCallback(() => {
        if (currentStepIndex > 0) {
            const nextIdx = currentStepIndex - 1;
            setCurrentStepIndex(nextIdx);
            const note = fullSequence[nextIdx];
            setActiveNoteId(`${note.s}-${note.f}`);
            playNote(note.midi);
        }
    }, [currentStepIndex, fullSequence]);

    const playAutoSequence = useCallback(async () => {
        if (isPlayingScale) return;
        setIsPlayingScale(true);
        resetSequence();

        for (let i = 0; i < fullSequence.length; i++) {
            setCurrentStepIndex(i);
            const item = fullSequence[i];
            setActiveNoteId(`${item.s}-${item.f}`);
            playNote(item.midi);
            await new Promise(r => setTimeout(r, 400));
        }

        setActiveNoteId(null);
        setIsPlayingScale(false);
    }, [isPlayingScale, fullSequence, resetSequence]);

    return {
        currentStepIndex,
        isPlayingScale,
        activeNoteId,
        setActiveNoteId,
        fullSequence,
        resetSequence,
        stepForward,
        stepBackward,
        playAutoSequence
    };
};
