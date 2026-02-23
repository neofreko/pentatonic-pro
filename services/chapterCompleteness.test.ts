
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PENTATONIC_POSITIONS } from '../data/positions';
import { NOTES, TUNING } from '../constants';
import { getIntervalName } from '../utils/musicLogic';
import { ScaleType } from '../types';

const LESSONS_DIR = path.join(__dirname, '../public/lessons');

// Helper to parse markdown (simplified version of the one in lessonLoader.ts)
const parseChapter = (markdown: string) => {
    const lines = markdown.split('\n');
    let targetScaleType: ScaleType = 'minor';
    let challenge = { targetInterval: '', requiredCount: 0 };
    let id = '';

    let processingSection: 'CHAPTER' | 'CHALLENGE' | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
            processingSection = 'CHAPTER';
        } else if (trimmed.startsWith('## Proficiency Challenge')) {
            processingSection = 'CHALLENGE';
        }

        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > -1) {
            const key = trimmed.substring(0, colonIndex).trim();
            const value = trimmed.substring(colonIndex + 1).trim();

            if (processingSection === 'CHAPTER') {
                if (key === 'targetScaleType') targetScaleType = value as ScaleType;
                if (key === 'id') id = value;
            } else if (processingSection === 'CHALLENGE') {
                if (key === 'targetInterval') challenge.targetInterval = value;
                if (key === 'requiredCount') challenge.requiredCount = parseInt(value, 10);
            }
        }
    }
    return { id, targetScaleType, challenge };
};

const getAvailableIntervals = (rootNote: string, scaleType: ScaleType, position: number) => {
    const rootIdx = NOTES.indexOf(rootNote);
    const lowEOpenIdx = TUNING[5]; // 4 (E)
    // Find fret for root on Low E. e.g. A (9) on E (4). 9-4=5.
    const baseFret = (rootIdx - lowEOpenIdx + 12) % 12;

    const posData = PENTATONIC_POSITIONS[scaleType][position];
    if (!posData) return [];

    const intervals: string[] = [];

    // Iterate through all strings and frets in the position
    posData.forEach(([sIdx, frets]) => {
        frets.forEach(fOffset => {
            const fret = baseFret + fOffset;
            // Calculate note index
            const openStringNoteIdx = TUNING[sIdx];
            const noteIdx = (openStringNoteIdx + fret) % 12;
            const noteName = NOTES[noteIdx];

            const interval = getIntervalName(noteName, rootNote, scaleType);
            intervals.push(interval);
        });
    });

    return intervals;
};

describe('Chapter Completeness', () => {
    const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.md'));

    files.forEach(file => {
        it(`should be completable: ${file}`, () => {
            const content = fs.readFileSync(path.join(LESSONS_DIR, file), 'utf-8');
            const { id, targetScaleType, challenge } = parseChapter(content);

            if (!challenge.targetInterval || !challenge.requiredCount) {
                // Some chapters might not have a challenge or configured differently
                // But for now we expect them to have it based on the prompt
                console.warn(`Skipping completeness check for ${file} - no challenge detected`);
                return;
            }

            // We assume Position 1 and Root 'A' as standard test case, 
            // but strictly speaking the app lets you choose. 
            // However, the challenge counts must be satisfiable in at least one standard configuration (Position 1 is the main teaching tool).
            // Chapter 1 is Chromatic, others are distinct.

            // Setup: Root A, Position 1
            const rootNote = 'A';
            const position = 1;

            const availablegtIntervals = getAvailableIntervals(rootNote, targetScaleType, position);

            const matchingCount = availablegtIntervals.filter(i => i === challenge.targetInterval).length;

            expect(matchingCount).toBeGreaterThanOrEqual(challenge.requiredCount);

            console.log(`${id}: Found ${matchingCount} of ${challenge.targetInterval} (Required: ${challenge.requiredCount})`);
        });
    });
});
