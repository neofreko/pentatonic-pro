import React, { useMemo } from 'react';
import { FRET_COUNT, MIDI_TUNING } from '../constants';
import { ScaleType } from '../types';
import { getNoteAtPosition, isNoteInScale, getIntervalName } from '../utils/musicLogic';
import { playNote } from '../utils/audio';

interface FretboardProps {
  rootNote: string;
  scaleType: ScaleType;
  showIntervals: boolean;
  fretMarkerType?: 'number' | 'note';
  activeNoteId?: string | null;
  noteTrail?: string[]; // History of recent notes for the "Visual Echo"
  activeStrings?: number[] | null;
  positionNoteIds?: Set<string>;
  onNoteClick?: (string: number, fret: number, noteName: string, interval: string) => void;
  hideLabels?: boolean;
  successNoteIds?: string[];
  heldNoteIds?: string[];
  errorNoteId?: string | null;
  highlightInterval?: string | null;
  hintNoteId?: string | null;
}

const Fretboard: React.FC<FretboardProps> = ({ 
  rootNote, 
  scaleType, 
  showIntervals, 
  fretMarkerType = 'number',
  activeNoteId, 
  noteTrail = [],
  activeStrings,
  positionNoteIds,
  onNoteClick,
  hideLabels = false,
  successNoteIds = [],
  heldNoteIds = [],
  errorNoteId = null,
  highlightInterval = null,
  hintNoteId = null
}) => {
  const strings = [0, 1, 2, 3, 4, 5]; 
  const stringNotes = ['E', 'B', 'G', 'D', 'A', 'E'];

  const getIntervalColor = (interval: string, isDimmed: boolean) => {
    if (isDimmed) return 'bg-slate-800 ring-slate-800 text-slate-500';
    
    switch (interval) {
      case 'R': return 'bg-amber-400 ring-amber-400 text-slate-950';
      case 'b3':
      case '3': return 'bg-emerald-400 ring-emerald-300 text-slate-950';
      case '4': return 'bg-sky-400 ring-sky-300 text-slate-950';
      case '5': return 'bg-indigo-400 ring-indigo-300 text-slate-950';
      case 'b7':
      case '7': return 'bg-rose-400 ring-rose-300 text-slate-950';
      case '2': return 'bg-orange-400 ring-orange-300 text-slate-950';
      case '6': return 'bg-fuchsia-400 ring-fuchsia-300 text-slate-950';
      default: return 'bg-slate-200 ring-slate-300 text-slate-950';
    }
  };

  const getNoteAppearance = (
    interval: string, 
    isRoot: boolean, 
    isInPosition: boolean, 
    isCurrentlyPlaying: boolean, 
    isTrailNote: boolean,
    trailIndex: number, // 0 is most recent, 3 is oldest
    isSuccess: boolean, 
    isHeld: boolean,
    isError: boolean, 
    isDimmed: boolean,
    isHint: boolean
  ) => {
    let base = "w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all duration-300 relative border-none cursor-pointer shadow-xl ring-2 ring-offset-2 ring-offset-[#0d121f]";
    let colors = getIntervalColor(interval, isDimmed);
    let effects = "";

    if (isCurrentlyPlaying) {
      colors = "bg-white text-slate-950 ring-white scale-125 z-[100] ring-offset-4";
      effects = "shadow-[0_0_50px_rgba(255,255,255,0.7)]";
    } else if (isHeld) {
      colors = "bg-amber-400 text-slate-950 ring-white scale-110 z-30";
      effects = "shadow-[0_0_30px_rgba(245,158,11,0.6)] ring-4 ring-offset-4";
    } else if (isHint) {
      colors = "bg-amber-500 text-slate-950 ring-amber-400 scale-110 z-30 animate-pulse";
      effects = "shadow-[0_0_30px_rgba(245,158,11,0.6)] ring-4 ring-offset-4";
    } else if (isTrailNote) {
      // Trail notes get progressively more transparent and lose their scale-up
      const opacity = [0.8, 0.6, 0.4, 0.2][trailIndex] || 0.1;
      effects = `opacity-[${opacity}] scale-${[115, 110, 105, 100][trailIndex]} z-[50] shadow-lg blur-[0.5px]`;
    } else if (isSuccess) {
      colors = "bg-green-500 text-white ring-green-400 scale-110 z-30";
      effects = "shadow-[0_0_30px_rgba(34,197,94,0.6)]";
    } else if (isError) {
      colors = "bg-red-500 text-white ring-red-400 scale-110 z-30 animate-shake";
      effects = "shadow-[0_0_20px_rgba(239,68,68,0.5)]";
    } else {
      if (isInPosition) {
        effects += " scale-110 z-20 shadow-[0_12px_30px_rgba(0,0,0,0.7)]";
      } else {
        effects += " shadow-lg";
      }

      if (isRoot) {
        effects += ` ring-white ${isDimmed ? 'ring-2 opacity-80' : 'ring-4'} ring-offset-2 shadow-[0_0_25px_rgba(245,158,11,0.2)]`;
      }
    }

    return `${base} ${colors} ${effects}`;
  };

  const handleNoteClick = (s: number, f: number, noteName: string, interval: string) => {
    const midiNote = MIDI_TUNING[s] + f;
    playNote(midiNote);
    if (onNoteClick) onNoteClick(s, f, noteName, interval);
  };

  const getFretLabel = (f: number) => {
    if (fretMarkerType === 'number') return f.toString();
    return getNoteAtPosition(5, f);
  };

  const boxRange = useMemo(() => {
    if (!positionNoteIds || positionNoteIds.size === 0) return null;
    let min = Infinity;
    let max = -Infinity;
    positionNoteIds.forEach(id => {
      const fret = parseInt(id.split('-')[1]);
      if (fret < min) min = fret;
      if (fret > max) max = fret;
    });
    return { min, max };
  }, [positionNoteIds]);

  const getInlay = (fret: number) => {
    const singleInlays = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubleInlays = [12, 24];
    const markerClass = "w-3 h-3 bg-slate-700/20 rounded-full shadow-inner border border-white/5";
    if (singleInlays.includes(fret)) return <div className={markerClass} />;
    if (doubleInlays.includes(fret)) {
      return (
        <div className="flex flex-col gap-16">
          <div className={markerClass} />
          <div className={markerClass} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full overflow-x-auto bg-[#0a0f1d] p-10 rounded-[3rem] border border-slate-800/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative">
      <div className="flex min-w-[1200px]">
        <div className="w-12 flex flex-col justify-between py-12 mr-12">
           {stringNotes.map((note, i) => {
             const isStringActive = activeStrings ? activeStrings.includes(i) : true;
             return (
               <div key={`string-label-${i}`} className={`flex-1 flex items-center justify-center transition-all duration-300 ${isStringActive ? 'opacity-100' : 'opacity-10'}`}>
                  <span className={`text-[14px] font-black uppercase tracking-tighter ${isStringActive ? 'text-amber-500' : 'text-slate-800'}`}>{note}</span>
               </div>
             );
           })}
        </div>

        <div className="flex-grow flex flex-col">
          <div className="flex mb-10 px-0">
            {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
              const isInBox = boxRange && f >= boxRange.min && f <= boxRange.max;
              return (
                <div 
                  key={`top-num-${f}`} 
                  className={`flex-1 text-center text-[15px] font-black tracking-widest uppercase transition-colors duration-500 ${
                    isInBox ? 'text-amber-500' : 'text-slate-400'
                  }`}
                >
                  {getFretLabel(f)}
                </div>
              );
            })}
          </div>

          <div className="relative h-[26rem] flex rounded-[3rem] overflow-hidden border border-slate-800/80 bg-[#0d121f] shadow-[inset_0_4px_80px_rgba(0,0,0,1)]">
            {boxRange && (
              <div 
                className="absolute h-full bg-white/[0.03] border-x border-white/5 z-0 transition-all duration-700"
                style={{
                  left: `${(boxRange.min / (FRET_COUNT + 1)) * 100}%`,
                  width: `${((boxRange.max - boxRange.min + 1) / (FRET_COUNT + 1)) * 100}%`
                }}
              />
            )}

            <div className="absolute inset-0 flex items-center justify-around pointer-events-none z-0">
              {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => (
                <div key={`inlay-${f}`} className="flex-1 flex items-center justify-center">
                  {getInlay(f)}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col justify-between relative z-10 py-8">
              {strings.map((s) => {
                const isStringActive = activeStrings ? activeStrings.includes(s) : true;
                return (
                  <div key={`string-${s}`} className="relative h-full flex items-center transition-all duration-300">
                    <div className="absolute w-full h-[1px] bg-black/90 translate-y-[3px]" style={{ height: `${1 + s * 0.6}px` }} />
                    <div className="absolute w-full h-[2.5px] bg-gradient-to-b from-slate-400 via-slate-500 to-slate-800" style={{ height: `${1 + s * 0.6}px` }} />
                    
                    <div className="flex-1 flex justify-around h-full">
                      {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
                        const noteName = getNoteAtPosition(s, f);
                        const active = isNoteInScale(noteName, rootNote, scaleType);
                        const isRoot = noteName === rootNote;
                        const interval = getIntervalName(noteName, rootNote, scaleType);
                        const noteId = `${s}-${f}`;
                        
                        const isCurrentlyPlaying = activeNoteId === noteId;
                        const trailIndex = noteTrail.indexOf(noteId);
                        const isTrailNote = trailIndex !== -1;
                        
                        const isSuccess = successNoteIds.includes(noteId);
                        const isHeld = heldNoteIds.includes(noteId);
                        const isError = errorNoteId === noteId;
                        const isHintNote = hintNoteId === noteId;
                        const isInPosition = positionNoteIds?.has(noteId);
                        
                        const isHighlighted = !highlightInterval || interval === highlightInterval;
                        const shouldDim = (!isHighlighted && active) || !isStringActive;

                        return (
                          <div key={`note-${s}-${f}`} className="flex-1 flex items-center justify-center relative transition-all duration-300">
                            <div className={`absolute right-0 top-0 bottom-0 w-[2px] h-full ${f === 0 ? 'bg-amber-100/40 w-[6px]' : 'bg-slate-800/80'}`} />
                            
                            {active && (
                              <div className="relative">
                                {isCurrentlyPlaying && (
                                  <div className="absolute inset-0 -m-10 border-[6px] border-white/40 rounded-full animate-ping z-0 pointer-events-none" />
                                )}
                                
                                <button 
                                  onClick={() => handleNoteClick(s, f, noteName, interval)} 
                                  className={getNoteAppearance(
                                    interval, 
                                    isRoot, 
                                    !!isInPosition, 
                                    !!isCurrentlyPlaying, 
                                    isTrailNote,
                                    trailIndex,
                                    !!isSuccess, 
                                    isHeld,
                                    !!isError, 
                                    shouldDim,
                                    isHintNote
                                  )}
                                >
                                  {(!hideLabels || isSuccess || isHeld || isCurrentlyPlaying || isTrailNote || isHintNote) && (
                                    <div className="flex flex-col items-center justify-center -space-y-1.5 pointer-events-none">
                                      <span className="text-[18px] font-black tracking-tighter">
                                        {showIntervals ? interval : noteName}
                                      </span>
                                    </div>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex mt-10">
            {Array.from({ length: FRET_COUNT + 1 }).map((_, f) => {
              const isInBox = boxRange && f >= boxRange.min && f <= boxRange.max;
              return (
                <div 
                  key={`bottom-num-${f}`} 
                  className={`flex-1 text-center text-[13px] font-black tracking-widest uppercase transition-colors duration-500 ${
                    isInBox ? 'text-amber-500/50' : 'text-slate-500'
                  }`}
                >
                  {getFretLabel(f)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
