import React from 'react';
import { Play, Music, Info } from 'lucide-react';
import { NOODLE_LIBRARY } from '../data/noodleLibrary';
import { parseNoodle } from '../utils/noodleParser';

interface NoodleLibraryProps {
    playNoodle: (sample: any[]) => void;
    currentKey: string;
}

export const NoodleLibrary: React.FC<NoodleLibraryProps> = ({ playNoodle, currentKey }) => {
    const samples = [
        {
            id: 'blues_solo_1',
            name: 'Mini Solo 1 (Smooth Blues)',
            author: 'Happy Bluesman',
            style: 'Blues',
            description: 'Focuses on b5 Blue Note phrasing and slides.',
            color: 'text-amber-500'
        },
        {
            id: 'blues_king',
            name: 'King of Blues',
            author: 'A. King Style',
            style: 'Blues',
            description: 'Slow, expressive bends and vocal-like phrasing.',
            color: 'text-indigo-400'
        },
        {
            id: 'rock_slash',
            name: 'Top Hat Shred',
            author: 'Rock Legend',
            style: 'Rock',
            description: 'Aggressive climbs and fast melodic runs.',
            color: 'text-red-500'
        },
        {
            id: 'soul_maggot',
            name: 'Cosmic Soul',
            author: 'P-Funk Style',
            style: 'Soul/Funk',
            description: 'Long ethereal sustains and wah-like dynamics.',
            color: 'text-purple-400'
        },
        {
            id: 'rock_hard',
            name: 'Metal Edge',
            author: 'Modern Rock',
            style: 'Rock',
            description: 'Triple picking and high-altitude power phrasing.',
            color: 'text-slate-400'
        }
    ];

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <Music className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Phrasing Lab</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Dose-test your theory with real melodic samples</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Sync: Key of {currentKey}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samples.map((sample) => (
                    <div
                        key={sample.id}
                        className="group bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 hover:border-amber-500/30 hover:bg-slate-800/40 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`text-[10px] font-black uppercase tracking-widest ${sample.color} bg-current/10 px-2 py-0.5 rounded`}>
                                {sample.style}
                            </div>
                            <button
                                onClick={() => playNoodle(parseNoodle((NOODLE_LIBRARY as any)[sample.id]))}
                                className="p-3 bg-amber-500 text-slate-950 rounded-xl hover:scale-110 active:scale-90 transition-all shadow-lg shadow-amber-500/20"
                            >
                                <Play className="w-4 h-4 fill-current" />
                            </button>
                        </div>

                        <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-amber-500 transition-colors">{sample.name}</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">by {sample.author}</p>

                        <div className="flex gap-2 items-start opacity-70 group-hover:opacity-100 transition-opacity">
                            <Info className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic">{sample.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
