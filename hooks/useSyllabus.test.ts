import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyllabus } from './useSyllabus';
import * as lessonLoader from '../services/lessonLoader';

vi.mock('../services/lessonLoader', () => ({
    loadLessons: vi.fn(),
}));

vi.mock('../services/aiService', () => ({
    getScaleLesson: vi.fn(),
}));

describe('useSyllabus', () => {
    const mockChapters = [
        { id: 'ch1', title: 'Chapter 1', tutorialSteps: [], targetScaleType: 'minor' },
        { id: 'ch2', title: 'Chapter 2', tutorialSteps: [], targetScaleType: 'minor' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (lessonLoader.loadLessons as any).mockResolvedValue(mockChapters);
    });

    it('should initialize with default values when localStorage is empty', async () => {
        const { result } = renderHook(() => useSyllabus('A', 'minor', 1));

        expect(result.current.currentChapterIndex).toBe(0);
        expect(result.current.completedChapters).toEqual([]);
        expect(result.current.phase).toBe('PREVIEW');
    });

    it('should load values from localStorage', () => {
        localStorage.setItem('current_chapter_index', '1');
        localStorage.setItem('completed_chapters', JSON.stringify(['ch1']));
        localStorage.setItem('app_phase', 'CHALLENGE');

        const { result } = renderHook(() => useSyllabus('A', 'minor', 1));

        expect(result.current.currentChapterIndex).toBe(1);
        expect(result.current.completedChapters).toEqual(['ch1']);
        expect(result.current.phase).toBe('CHALLENGE');
    });

    it('should save currentChapterIndex to localStorage when changed', async () => {
        const { result } = renderHook(() => useSyllabus('A', 'minor', 1));

        await act(async () => {
            result.current.selectChapter(1, () => { });
        });

        expect(localStorage.getItem('current_chapter_index')).toBe('1');
    });

    it('should save completedChapters to localStorage when changed', () => {
        const { result } = renderHook(() => useSyllabus('A', 'minor', 1));

        act(() => {
            result.current.setCompletedChapters(['ch1']);
        });

        expect(localStorage.getItem('completed_chapters')).toBe(JSON.stringify(['ch1']));
    });
});
