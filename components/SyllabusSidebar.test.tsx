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

    it('should allow clicking any chapter (unlocked)', () => {
        const onSelectChapter = vi.fn();

        render(
            <SyllabusSidebar
                chapters={mockChapters}
                currentChapterIndex={0}
                completedChapters={[]}
                onSelectChapter={onSelectChapter}
            />
        );

        // Chapter 3 should be clickable even if none are completed
        const chapter3 = screen.getByText('Chapter 3').closest('button');
        fireEvent.click(chapter3!);
        expect(onSelectChapter).toHaveBeenCalledWith(2);
        expect(chapter3).not.toBeDisabled();
    });

    it('should highlight active chapter', () => {
        render(
            <SyllabusSidebar
                chapters={mockChapters}
                currentChapterIndex={1}
                completedChapters={[]}
                onSelectChapter={() => { }}
            />
        );

        const chapter2Container = screen.getByText('Chapter 2').closest('button');
        // It should have amber text or background class depending on implementation
        expect(chapter2Container?.className).toContain('translate-x-2');
    });

    it('should show checkmark for completed chapters', () => {
        const { container } = render(
            <SyllabusSidebar
                chapters={mockChapters}
                currentChapterIndex={0}
                completedChapters={['ch1']}
                onSelectChapter={() => { }}
            />
        );

        // Find any svg (Lucide icons are rendered as SVGs)
        const checkIcon = container.querySelector('svg');
        expect(checkIcon).toBeTruthy();
    });
});
