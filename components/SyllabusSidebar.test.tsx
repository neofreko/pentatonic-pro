import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SyllabusSidebar } from './SyllabusSidebar';
import { Chapter } from '../types';

describe('SyllabusSidebar', () => {
    const mockChapters: Chapter[] = [
        { id: 'ch1', title: 'Chapter 1', focus: 'Focus 1', description: '', targetScaleType: 'minor', mission: '', challenge: { type: 'FIND_INTERVALS', targetInterval: 'R', requiredCount: 1, description: '' }, tutorialSteps: [] },
        { id: 'ch2', title: 'Chapter 2', focus: 'Focus 2', description: '', targetScaleType: 'minor', mission: '', challenge: { type: 'FIND_INTERVALS', targetInterval: 'R', requiredCount: 1, description: '' }, tutorialSteps: [] },
        { id: 'ch3', title: 'Chapter 3', focus: 'Focus 3', description: '', targetScaleType: 'minor', mission: '', challenge: { type: 'FIND_INTERVALS', targetInterval: 'R', requiredCount: 1, description: '' }, tutorialSteps: [] },
    ];

    it('should lock chapters that are not completed following the sequence', () => {
        const onSelectChapter = vi.fn();
        const completedChapters = ['ch1']; // Only first is completed

        render(
            <SyllabusSidebar
                chapters={mockChapters}
                currentChapterIndex={0}
                completedChapters={completedChapters}
                onSelectChapter={onSelectChapter}
            />
        );

        // Chapter 1 should be clickable
        const chapter1 = screen.getByText('Chapter 1').closest('button');
        fireEvent.click(chapter1!);
        expect(onSelectChapter).toHaveBeenCalledWith(0);

        // Chapter 2 should be clickable (it's the next one after a completed one)
        const chapter2 = screen.getByText('Chapter 2').closest('button');
        fireEvent.click(chapter2!);
        expect(onSelectChapter).toHaveBeenCalledWith(1);

        // Chapter 3 should be locked (Chapter 2 is not completed)
        const chapter3 = screen.getByText('Chapter 3').closest('button');
        fireEvent.click(chapter3!);
        expect(onSelectChapter).not.toHaveBeenCalledWith(2);
        expect(chapter3).toBeDisabled();
    });

    it('should show lock icon for locked chapters', () => {
        render(
            <SyllabusSidebar
                chapters={mockChapters}
                currentChapterIndex={0}
                completedChapters={[]}
                onSelectChapter={() => { }}
            />
        );

        // Chapter 2 and 3 should be locked if Chapter 1 is not completed
        const lockedText = screen.getAllByText('Locked');
        expect(lockedText.length).toBe(2);
    });
});
