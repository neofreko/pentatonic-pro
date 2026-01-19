import React from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Volume2, Play } from 'lucide-react';

interface AppControlsProps {
    currentPosition: number;
    setCurrentPosition: (pos: number) => void;
    resetSequence: () => void;
    stepBackward: () => void;
    stepForward: () => void;
    playAutoSequence: () => void;
    isPlayingScale: boolean;
    currentStepIndex: number;
    fullSequenceLength: number;
    showIntervals: boolean;
    setShowIntervals: (show: boolean) => void;
    rootNote: string;
    scaleType: string;
    currentStepData: any;
}

export const AppControls: React.FC<AppControlsProps> = ({
    currentPosition,
    setCurrentPosition,
    resetSequence,
    stepBackward,
    stepForward,
    playAutoSequence,
    isPlayingScale,
    currentStepIndex,
    fullSequenceLength,
    showIntervals,
    setShowIntervals,
    rootNote,
    scaleType,
    currentStepData
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Scale Box Visualizer</h3>
                    <p className="text-xs text-slate-400 font-bold">{rootNote} {scaleType === 'minor' ? 'Minor' : 'Major'} Pentatonic</p>
                </div>
                {currentStepData && (
                    <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-500/50 px-4 py-2 rounded-2xl animate-in zoom-in duration-300 shadow-lg shadow-amber-500/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-amber-500/60 leading-none mb-0.5">Pattern: Groups of 3</span>
                            <span className="text-xs font-black text-amber-500 leading-none">Step {currentStepData.tripletIdx} of 3</span>
                        </div>
                        <div className="w-[1px] h-6 bg-amber-500/20" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-amber-500/60 leading-none mb-0.5">2 Notes Per String</span>
                            <span className="text-xs font-black text-amber-500 leading-none uppercase tracking-tighter">Triplet Sequence</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 hidden sm:block">Box Position</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(p => (
                            <button
                                key={p}
                                onClick={() => { setCurrentPosition(p); resetSequence(); }}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPosition === p ? 'bg-amber-500 text-slate-950 shadow-lg scale-110 z-10' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
                    <button onClick={resetSequence} className="p-2.5 text-slate-500 hover:text-white transition-colors" title="Reset">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-800 mx-1" />
                    <button onClick={stepBackward} disabled={currentStepIndex <= 0} className="p-2.5 text-slate-400 hover:text-amber-500 disabled:opacity-20 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={stepForward} disabled={currentStepIndex >= fullSequenceLength - 1} className="p-2.5 text-slate-400 hover:text-amber-500 disabled:opacity-20 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-800 mx-1" />
                    <button onClick={playAutoSequence} disabled={isPlayingScale} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPlayingScale ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
                        {isPlayingScale ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Play className="w-4 h-4" />}
                        <span className="hidden sm:inline">Play Sequence</span>
                    </button>
                </div>

                <button onClick={() => setShowIntervals(!showIntervals)} className={`text-[10px] font-black px-5 py-2.5 rounded-2xl border transition-all uppercase tracking-widest ${showIntervals ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                    {showIntervals ? 'Intervals' : 'Notes'}
                </button>
            </div>
        </div>
    );
};
