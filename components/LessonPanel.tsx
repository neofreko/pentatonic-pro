import React from 'react';
import { Activity, Sparkles } from 'lucide-react';

interface LessonPanelProps {
    lesson: string | null;
    loadingLesson: boolean;
    onRefresh: () => void;
}

export const LessonPanel: React.FC<LessonPanelProps> = ({
    lesson,
    loadingLesson,
    onRefresh
}) => {
    return (
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-150 shadow-3xl">
            <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3"><Activity className="w-4 h-4 text-amber-500" /> Lesson: Triplets on 2-Note Strings</h4>
                <button onClick={onRefresh} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-all hover:text-amber-500"><Sparkles className="w-4 h-4" /></button>
            </div>
            <div className="p-10 prose prose-invert prose-sm max-w-none min-h-[250px] font-medium leading-relaxed selection:bg-amber-500/20">
                {loadingLesson ? (
                    <div className="flex flex-col items-center py-24 gap-6">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                            <div className="absolute inset-0 bg-amber-500 animate-[loading_1.5s_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 animate-pulse">Calculating Triplet Groups...</p>
                    </div>
                ) : (
                    <div className="text-slate-400 whitespace-pre-wrap leading-loose">{lesson}</div>
                )}
            </div>
        </div>
    );
};
