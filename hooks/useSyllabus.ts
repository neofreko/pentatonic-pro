import { useState, useCallback, useEffect } from 'react';
import { loadLessons } from '../services/lessonLoader';
import { getScaleLesson } from '../services/aiService';
import { Chapter, ScaleType } from '../types';

export type AppPhase = 'PREVIEW' | 'LEARNING' | 'CHALLENGE' | 'PHRASING_LAB';

export const useSyllabus = (rootNote: string, scaleType: ScaleType, currentPosition: number) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
        const saved = localStorage.getItem('current_chapter_index');
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
        localStorage.setItem('current_chapter_index', currentChapterIndex.toString());
    }, [currentChapterIndex]);

    const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
        const saved = localStorage.getItem('completed_chapters');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('completed_chapters', JSON.stringify(completedChapters));
    }, [completedChapters]);
    const [phase, setPhase] = useState<AppPhase>(() => {
        const saved = localStorage.getItem('app_phase');
        return (saved as AppPhase) || 'PREVIEW';
    });

    useEffect(() => {
        localStorage.setItem('app_phase', phase);
    }, [phase]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [tutorialSuccess, setTutorialSuccess] = useState(false);
    const [lesson, setLesson] = useState<string | null>(null);
    const [loadingLesson, setLoadingLesson] = useState(false);

    useEffect(() => {
        loadLessons().then(data => {
            setChapters(data);
            setLoadingChapters(false);
        });
    }, []);

    const currentChapter = chapters[currentChapterIndex];
    // Guard against initial null state
    const currentStep = currentChapter ? currentChapter.tutorialSteps[activeStepIndex] : undefined;

    const fetchLesson = useCallback(async () => {
        if (!currentChapter) return;
        setLoadingLesson(true);
        const content = await getScaleLesson(rootNote, scaleType, currentChapter, currentPosition);
        setLesson(content);
        setLoadingLesson(false);
    }, [rootNote, scaleType, currentChapter, currentPosition]);

    useEffect(() => {
        if (phase === 'LEARNING') {
            fetchLesson();
        }
    }, [phase, fetchLesson]);

    const selectChapter = useCallback((index: number, onChapterSelect: (scaleType: ScaleType) => void) => {
        setCurrentChapterIndex(index);
        if (chapters[index]) {
            onChapterSelect(chapters[index].targetScaleType);
        }
        setPhase('PREVIEW');
        setActiveStepIndex(0);
        setTutorialSuccess(false);
    }, [chapters]);

    return {
        chapters,
        loadingChapters,
        currentChapterIndex,
        completedChapters,
        setCompletedChapters,
        phase,
        setPhase,
        activeStepIndex,
        setActiveStepIndex,
        tutorialSuccess,
        setTutorialSuccess,
        lesson,
        loadingLesson,
        currentChapter,
        currentStep,
        fetchLesson,
        selectChapter
    };
};
