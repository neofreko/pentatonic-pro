import React from 'react';

interface FretNoteProps {
    noteName: string;
    interval: string;
    isRoot: boolean;
    isInPosition: boolean;
    isCurrentlyPlaying: boolean;
    isSuccess: boolean;
    isError: boolean;
    hideLabels: boolean;
    shouldDim: boolean;
    onClick: () => void;
}

const getIntervalColor = (interval: string) => {
    switch (interval) {
        case 'R': return 'bg-[#FBBF24] ring-[#F59E0B] text-slate-950'; // Root: Amber
        case '2': return 'bg-[#FB923C] ring-[#F97316] text-slate-950'; // 2nd: Orange
        case 'b3':
        case '3': return 'bg-[#34D399] ring-[#10B981] text-slate-950'; // 3rd: Emerald
        case '4': return 'bg-[#38BDF8] ring-[#0EA5E9] text-slate-950'; // 4th: Sky
        case '5': return 'bg-[#818CF8] ring-[#6366F1] text-slate-950'; // 5th: Indigo
        case '6': return 'bg-[#C084FC] ring-[#A855F7] text-slate-950'; // 6th: Fuchsia
        case 'b7':
        case '7': return 'bg-[#FB7185] ring-[#F43F5E] text-slate-950'; // 7th: Rose
        default: return 'bg-slate-200 ring-slate-300 text-slate-900';
    }
};

const getNoteAppearance = (
    interval: string,
    isRoot: boolean,
    isInPosition: boolean,
    isCurrentlyPlaying: boolean,
    isSuccess: boolean,
    isError: boolean
) => {
    let base = "w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative border-none cursor-pointer shadow-2xl ring-2 ring-offset-2 ring-offset-[#0d121f]";
    let colors = "";
    let effects = "shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)]";

    if (isCurrentlyPlaying) {
        colors = "bg-white text-slate-950 ring-white scale-125 z-[100] ring-offset-4";
        effects = "shadow-[0_0_60px_rgba(255,255,255,0.8)]";
    } else if (isSuccess) {
        colors = "bg-[#22C55E] text-white ring-[#22C55E] scale-110 z-30";
        effects = "shadow-[0_0_30px_rgba(34,197,94,0.6)]";
    } else if (isError) {
        colors = "bg-[#EF4444] text-white ring-[#EF4444] scale-110 z-30 animate-shake";
        effects = "shadow-[0_0_20px_rgba(239,68,68,0.5)]";
    } else {
        const intervalStyles = getIntervalColor(interval);
        if (isInPosition) {
            colors = `${intervalStyles} scale-110 z-20`;
            effects += ` shadow-[0_15px_35px_rgba(0,0,0,0.8)] ${isRoot ? 'shadow-amber-500/40' : ''}`;
        } else {
            colors = `${intervalStyles} scale-95 z-10`;
            effects += " shadow-lg opacity-90";
        }

        if (isRoot) {
            effects += " ring-[#FFFFFF] ring-4 ring-offset-[3px] ring-offset-[#0d121f] scale-115";
            effects += " shadow-[0_0_20px_rgba(251,191,36,0.3)]";
        }
    }

    return `${base} ${colors} ${effects}`;
};

export const FretNote: React.FC<FretNoteProps> = ({
    noteName,
    interval,
    isRoot,
    isInPosition,
    isCurrentlyPlaying,
    isSuccess,
    isError,
    hideLabels,
    shouldDim,
    onClick
}) => {
    const containerOpacity = shouldDim ? 'opacity-30 grayscale-[0.5] blur-[0.3px]' : 'opacity-100';

    const labelContent = (
        <div className="flex flex-col items-center justify-center pointer-events-none">
            <span className={`font-black leading-none tracking-tight ${interval.length > 1 ? 'text-[16px]' : 'text-[19px]'}`}>
                {interval}
            </span>
            <div className="w-5 h-[1.5px] bg-black/15 my-1 rounded-full" />
            <span className="text-[10px] font-bold uppercase leading-none tracking-widest opacity-70">
                {noteName}
            </span>
        </div>
    );

    return (
        <div className={`flex-1 flex items-center justify-center relative transition-all duration-500 ${containerOpacity} ${shouldDim ? 'scale-90' : 'scale-100'}`}>
            <div className="relative">
                {isCurrentlyPlaying && (
                    <div className="absolute inset-0 -m-10 border-[6px] border-white/30 rounded-full animate-ping z-0 pointer-events-none" />
                )}

                <button
                    onClick={onClick}
                    className={getNoteAppearance(interval, isRoot, isInPosition, isCurrentlyPlaying, isSuccess, isError)}
                >
                    {(hideLabels && !isSuccess && !isCurrentlyPlaying) ? '' : labelContent}
                </button>

                {isCurrentlyPlaying && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-12 z-[110] animate-in fade-in zoom-in slide-in-from-bottom-6 duration-300 pointer-events-none">
                        <div className="bg-white text-slate-950 px-6 py-3 rounded-2xl font-black text-[15px] whitespace-nowrap shadow-[0_30px_70px_rgba(0,0,0,0.7)] border-2 border-amber-500 uppercase tracking-tighter flex items-center gap-3">
                            <span className="w-3.5 h-3.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                            <span className="text-slate-900">{noteName}</span>
                            <span className="text-slate-300 font-light text-[20px]">/</span>
                            <span className="text-amber-600">{interval}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

