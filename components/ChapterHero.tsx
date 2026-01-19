import React from 'react';
import { Award, PlayCircle } from 'lucide-react';
import { Chapter } from '../types';

interface ChapterHeroProps {
    chapter: Chapter;
    chapterIndex: number;
    onStartLesson: () => void;
    onJumpToChallenge: () => void;
}

export const ChapterHero: React.FC<ChapterHeroProps> = ({
    chapter,
    chapterIndex,
    onStartLesson,
    onJumpToChallenge
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-12 relative overflow-hidden shadow-3xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="relative z-10 max-w-3xl">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-amber-500/20">
                        <Award className="w-3 h-3" /> Chapter {chapterIndex + 1}
                    </span>
                    <h2 className="text-6xl font-black mb-8 leading-tight tracking-tighter">{chapter.title}</h2>
                    <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium">{chapter.description}</p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={onStartLesson} className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20 group">
                            <PlayCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Start Masterclass
                        </button>
                        <button onClick={onJumpToChallenge} className="flex items-center gap-3 px-8 py-5 bg-slate-800 text-slate-100 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all border border-slate-700">
                            Jump to Challenge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
