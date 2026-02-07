import React from 'react';
import { ListChecks, CheckCircle2, Lock } from 'lucide-react';
import { Chapter } from '../types';

interface SyllabusSidebarProps {
    chapters: Chapter[];
    currentChapterIndex: number;
    completedChapters: string[];
    onSelectChapter: (index: number) => void;
}

export const SyllabusSidebar: React.FC<SyllabusSidebarProps> = ({
    chapters,
    currentChapterIndex,
    completedChapters,
    onSelectChapter
}) => {
    return (
        <aside className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sticky top-8 backdrop-blur-sm">
                <h2 className="font-black flex items-center gap-2 text-slate-400 mb-8 uppercase tracking-widest text-[10px]">
                    <ListChecks className="w-4 h-4 text-amber-500" /> Syllabus Progress
                </h2>
                <div className="space-y-4">
                    {chapters.map((ch, idx) => {
                        const isActive = currentChapterIndex === idx;
                        const isCompleted = completedChapters.includes(ch.id);
                        const isLocked = idx > 0 && !completedChapters.includes(chapters[idx - 1].id);

                        return (
                            <button
                                key={ch.id}
                                onClick={() => !isLocked && onSelectChapter(idx)}
                                disabled={isLocked}
                                className={`w-full text-left group flex items-center gap-4 transition-all ${isActive ? 'translate-x-2' : ''} ${isLocked ? 'cursor-not-allowed' : ''}`}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-lg ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-amber-500 text-slate-950 scale-110' : isLocked ? 'bg-slate-900 text-slate-700' : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700 group-hover:text-slate-400'
                                    }`}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : idx + 1}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className={`text-sm font-bold transition-colors truncate ${isActive ? 'text-amber-500' : isLocked ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        {ch.title}
                                    </div>
                                    <div className="text-[10px] text-slate-600 truncate uppercase font-bold tracking-widest mt-0.5">{isLocked ? 'Locked' : ch.focus}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};
