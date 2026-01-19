import { useState, useMemo } from 'react';
import { NOTES, TUNING, PENTATONIC_POSITIONS } from '../constants';
import { ScaleType } from '../types';

export const usePentatonicScale = (initialRoot = 'A', initialScale: ScaleType = 'minor') => {
    const [rootNote, setRootNote] = useState(initialRoot);
    const [scaleType, setScaleType] = useState<ScaleType>(initialScale);
    const [currentPosition, setCurrentPosition] = useState<number>(1);

    const currentPositionNoteIds = useMemo(() => {
        const rootIdx = NOTES.indexOf(rootNote);
        const lowEOpenIdx = TUNING[5];
        const baseFret = (rootIdx - lowEOpenIdx + 12) % 12;

        const posData = PENTATONIC_POSITIONS[scaleType][currentPosition as keyof typeof PENTATONIC_POSITIONS['minor']];
        const ids = new Set<string>();

        posData.forEach(([sIdx, frets]: [number, number[]]) => {
            frets.forEach(fOffset => {
                let f = baseFret + fOffset;
                while (f < 0) f += 12;
                while (f > 24) f -= 12;
                ids.add(`${sIdx}-${f}`);
            });
        });
        return ids;
    }, [rootNote, scaleType, currentPosition]);

    return {
        rootNote,
        setRootNote,
        scaleType,
        setScaleType,
        currentPosition,
        setCurrentPosition,
        currentPositionNoteIds
    };
};
