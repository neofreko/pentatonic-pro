import React from 'react';
import { Music } from 'lucide-react';
import { NOTES } from '../constants';
import { ScaleType } from '../types';

interface AppHeaderProps {
    rootNote: string;
    setRootNote: (note: string) => void;
    scaleType: ScaleType;
    setScaleType: (type: ScaleType) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    rootNote,
    setRootNote,
    scaleType,
    setScaleType
}) => {
    return (
        <header className="max-w-7xl mx-auto w-full mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-900 pb-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Music className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Pentatonic Pro</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium">Interactive fretboard and AI tutor for mastering scales.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 backdrop-blur-md">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black px-1">Key</label>
                    <select
                        value={rootNote}
                        onChange={(e) => setRootNote(e.target.value)}
                        className="bg-slate-800 text-slate-100 border-none rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-amber-500 transition-all hover:bg-slate-700"
                    >
                        {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1 border-l border-slate-800 pl-4">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Mode</label>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold transition-colors ${scaleType === 'minor' ? 'text-amber-500' : 'text-slate-600'}`}>Minor</span>
                        <button
                            onClick={() => setScaleType(scaleType === 'minor' ? 'major' : 'minor')}
                            className={`w-10 h-5 rounded-full p-1 transition-all ${scaleType === 'minor' ? 'bg-slate-700' : 'bg-amber-600'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${scaleType === 'major' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-xs font-bold transition-colors ${scaleType === 'major' ? 'text-amber-500' : 'text-slate-600'}`}>Major</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
