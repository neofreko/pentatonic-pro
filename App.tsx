import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NOTES, MIDI_TUNING, TUNING } from './constants';
import { ScaleType, TutorialStep } from './types';
import { CHAPTERS } from './data/chapters';
import { PENTATONIC_POSITIONS } from './data/positions';
import Fretboard from './components/Fretboard';
import { getScaleLesson } from './services/geminiService';
import { 
  Music, Sparkles, ChevronRight, Play, Volume2, CheckCircle2, 
  ListChecks, Trophy, GraduationCap, PlayCircle, Award, 
  Hash, Type as TypeIcon, ChevronLeft, RotateCcw, Activity, 
  Timer, Bell, BellOff, Square, Waves, Repeat, FlaskConical,
  Zap, ArrowRightLeft, BrainCircuit
} from 'lucide-react';
import { playNote, initAudio, setBpm, startSequence, stopActiveSequence, toggleMetronome, toggleDrone } from './utils/audio';

type AppPhase = 'PREVIEW' | 'LEARNING' | 'CHALLENGE' | 'PHRASING_LAB';
type FretMarkerType = 'number' | 'note';
type PhrasingPattern = 'LINEAR' | 'TRIPLETS' | 'QUARTETS' | 'STRING_SKIP';

const App: React.FC = () => {
  const [rootNote, setRootNote] = useState('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minor');
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [showIntervals, setShowIntervals] = useState(true);
  const [fretMarkerType, setFretMarkerType] = useState<FretMarkerType>('number');
  const [lesson, setLesson] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTrail, setNoteTrail] = useState<string[]>([]);
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [bpm, setBpmState] = useState(80);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isDroneOn, setIsDroneOn] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [phrasingPattern, setPhrasingPattern] = useState<PhrasingPattern>('LINEAR');
  
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const activeNoteTimeoutRef = useRef<number | null>(null);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [phase, setPhase] = useState<AppPhase>('PREVIEW');

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [tutorialSuccess, setTutorialSuccess] = useState(false);

  const [successNoteIds, setSuccessNoteIds] = useState<string[]>([]);
  const [errorNoteId, setErrorNoteId] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const currentChapter = CHAPTERS[currentChapterIndex];
  const currentStep: TutorialStep | undefined = currentChapter.tutorialSteps[activeStepIndex];

  const rootMidi = useMemo(() => {
    const idx = NOTES.indexOf(rootNote);
    return MIDI_TUNING[5] + idx; 
  }, [rootNote]);

  const updateBpm = (newBpm: number) => {
    setBpmState(newBpm);
    setBpm(newBpm);
  };

  const handleMetronomeToggle = () => {
    const nextState = !isMetronomeOn;
    setIsMetronomeOn(nextState);
    initAudio();
    toggleMetronome(nextState);
  };

  const handleDroneToggle = () => {
    const nextState = !isDroneOn;
    setIsDroneOn(nextState);
    initAudio();
    toggleDrone(rootMidi, nextState);
  };

  useEffect(() => {
    if (isDroneOn) toggleDrone(rootMidi, true);
  }, [rootMidi, isDroneOn]);

  const fetchLesson = useCallback(async () => {
    setLoadingLesson(true);
    const mode = phase === 'PHRASING_LAB' ? 'PHRASING' : 'CURRICULUM';
    const content = await getScaleLesson(rootNote, scaleType, currentChapter, currentPosition, mode as any, phrasingPattern);
    setLesson(content);
    setLoadingLesson(false);
  }, [rootNote, scaleType, currentChapter, currentPosition, phase, phrasingPattern]);

  const currentPositionNoteIds = useMemo(() => {
    const rootIdx = NOTES.indexOf(rootNote);
    const lowEOpenIdx = TUNING[5];
    const baseFret = (rootIdx - lowEOpenIdx + 12) % 12;
    const posData = PENTATONIC_POSITIONS[scaleType][currentPosition];
    const ids = new Set<string>();
    posData.forEach(([sIdx, frets]) => {
      frets.forEach(fOffset => {
        let f = baseFret + fOffset;
        while (f < 0) f += 12;
        while (f > 24) f -= 12;
        ids.add(`${sIdx}-${f}`);
      });
    });
    return ids;
  }, [rootNote, scaleType, currentPosition]);

  const dynamicSequence = useMemo(() => {
    const notesInBox = Array.from(currentPositionNoteIds).map((id: string) => {
      const [s, f] = id.split('-').map(Number);
      return { s, f, midi: MIDI_TUNING[s] + f };
    }).sort((a, b) => a.midi - b.midi);

    if (notesInBox.length < 4) return [];

    const sequence: {midi: number, id: string}[] = [];
    
    if (phrasingPattern === 'LINEAR') {
      notesInBox.forEach(n => sequence.push({ midi: n.midi, id: `${n.s}-${n.f}` }));
      [...notesInBox].reverse().forEach(n => sequence.push({ midi: n.midi, id: `${n.s}-${n.f}` }));
    } else if (phrasingPattern === 'TRIPLETS') {
      for (let i = 0; i < notesInBox.length - 2; i++) {
        [0, 1, 2].forEach(off => sequence.push({ midi: notesInBox[i+off].midi, id: `${notesInBox[i+off].s}-${notesInBox[i+off].f}` }));
      }
    } else if (phrasingPattern === 'QUARTETS') {
      for (let i = 0; i < notesInBox.length - 3; i++) {
        [0, 1, 2, 3].forEach(off => sequence.push({ midi: notesInBox[i+off].midi, id: `${notesInBox[i+off].s}-${notesInBox[i+off].f}` }));
      }
    } else if (phrasingPattern === 'STRING_SKIP') {
      const byString: Record<number, any[]> = {};
      notesInBox.forEach(n => {
        if (!byString[n.s]) byString[n.s] = [];
        byString[n.s].push(n);
      });
      const order = [5, 3, 4, 2, 3, 1, 2, 0];
      order.forEach(sIdx => {
        if (byString[sIdx]) byString[sIdx].forEach(n => sequence.push({ midi: n.midi, id: `${n.s}-${n.f}` }));
      });
    }

    return sequence;
  }, [currentPositionNoteIds, phrasingPattern]);

  const resetSequence = () => {
    stopActiveSequence();
    setCurrentStepIndex(-1);
    setActiveNoteId(null);
    setNoteTrail([]);
    setIsPlayingScale(false);
  };

  const playAutoSequence = async () => {
    if (isPlayingScale) {
      resetSequence();
      return;
    }
    await initAudio();
    setIsPlayingScale(true);
    startSequence(dynamicSequence, (id) => {
      setActiveNoteId(id);
      if (id) {
        setNoteTrail(prev => [id, ...prev].slice(0, 4));
      }
    }, () => { 
      if (!isLooping) setIsPlayingScale(false); 
    }, isLooping);
  };

  const handleNoteClick = (s: number, f: number, noteName: string, interval: string) => {
    initAudio();
    const noteId = `${s}-${f}`;
    setActiveNoteId(noteId);
    setNoteTrail(prev => [noteId, ...prev].slice(0, 4));
    if (activeNoteTimeoutRef.current) window.clearTimeout(activeNoteTimeoutRef.current);
    activeNoteTimeoutRef.current = window.setTimeout(() => setActiveNoteId(null), 1000);

    if (phase === 'CHALLENGE') {
      if (challengeComplete || successNoteIds.includes(noteId)) return;
      if (interval === currentChapter.challenge.targetInterval) {
        const newSuccess = [...successNoteIds, noteId];
        setSuccessNoteIds(newSuccess);
        if (newSuccess.length >= currentChapter.challenge.requiredCount) {
          setChallengeComplete(true);
          if (!completedChapters.includes(currentChapter.id)) setCompletedChapters(prev => [...prev, currentChapter.id]);
        }
      } else {
        setErrorNoteId(noteId);
        setTimeout(() => setErrorNoteId(null), 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 p-4 md:p-8 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="max-w-7xl mx-auto w-full mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-500/10 rounded-2xl shadow-inner border border-amber-500/20">
            <Music className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">Pentatonic Pro</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1 opacity-60">Fretboard Mastery Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-slate-900/60 p-4 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-1 px-4 border-r border-white/5">
            <label className="text-[9px] uppercase tracking-[0.2em] text-amber-500/60 font-black">Performance Controls</label>
            <div className="flex items-center gap-3">
              <button onClick={handleMetronomeToggle} className={`p-2.5 rounded-xl transition-all ${isMetronomeOn ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}><Bell className="w-4 h-4" /></button>
              <button onClick={handleDroneToggle} className={`p-2.5 rounded-xl transition-all ${isDroneOn ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}><Waves className={`w-4 h-4 ${isDroneOn ? 'animate-pulse' : ''}`} /></button>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <Timer className="w-4 h-4 text-slate-500" />
              <input type="range" min="40" max="220" value={bpm} onChange={(e) => updateBpm(Number(e.target.value))} className="w-20 accent-amber-500 bg-slate-800 h-1.5 rounded-full" />
              <span className="text-xs font-black w-8 text-amber-400">{bpm}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 px-4">
            <label className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Harmonic Setup</label>
            <div className="flex items-center gap-4">
              <select value={rootNote} onChange={(e) => setRootNote(e.target.value)} className="bg-transparent text-slate-100 font-black text-sm outline-none">
                {NOTES.map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
              </select>
              <button onClick={() => setScaleType(scaleType === 'minor' ? 'major' : 'minor')} className="text-xs font-black uppercase tracking-widest text-amber-500 hover:text-amber-400">{scaleType}</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-12 flex-grow">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 sticky top-8 backdrop-blur-md space-y-8">
            <button 
              onClick={() => { setPhase('PHRASING_LAB'); resetSequence(); fetchLesson(); }}
              className={`w-full p-6 rounded-2xl border flex items-center gap-4 transition-all ${phase === 'PHRASING_LAB' ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-105' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700'}`}
            >
              <FlaskConical className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-widest">Phrasing Lab</div>
                <div className="text-[9px] opacity-60 uppercase font-bold">Lick Experimentation</div>
              </div>
            </button>

            <div className="space-y-4">
              <h2 className="font-black flex items-center gap-3 text-slate-400 uppercase tracking-widest text-[10px]">
                <ListChecks className="w-4 h-4 text-amber-500" /> Curriculum
              </h2>
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id} onClick={() => { setCurrentChapterIndex(idx); setPhase('PREVIEW'); resetSequence(); }}
                  className={`w-full text-left flex items-center gap-4 p-3 rounded-xl transition-all ${currentChapterIndex === idx && phase !== 'PHRASING_LAB' ? 'bg-amber-500/10 border border-amber-500/20' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${completedChapters.includes(ch.id) ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest truncate">{ch.title}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-12 pb-24">
          {phase === 'PHRASING_LAB' ? (
            <div className="space-y-12 animate-in zoom-in-95 duration-500">
               <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-indigo-500/10 rounded-[1.5rem] border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                        <Zap className="w-8 h-8 text-indigo-400" />
                     </div>
                     <div>
                        <h2 className="text-4xl font-black tracking-tight">Phrasing Lab</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Scale Logic: {rootNote} {scaleType}</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
                     {[
                       { id: 'LINEAR', icon: <ChevronRight />, label: 'Linear' },
                       { id: 'TRIPLETS', icon: <RotateCcw />, label: 'Triplets' },
                       { id: 'QUARTETS', icon: <Repeat />, label: 'Quartets' },
                       { id: 'STRING_SKIP', icon: <ArrowRightLeft />, label: 'Skips' }
                     ].map(p => (
                       <button 
                         key={p.id} 
                         onClick={() => { setPhrasingPattern(p.id as PhrasingPattern); resetSequence(); fetchLesson(); }}
                         className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phrasingPattern === p.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                       >
                         {p.icon} {p.label}
                       </button>
                     ))}
                  </div>
               </div>

               <Fretboard 
                 rootNote={rootNote} scaleType={scaleType} showIntervals={showIntervals} 
                 fretMarkerType={fretMarkerType} activeNoteId={activeNoteId} 
                 noteTrail={noteTrail}
                 positionNoteIds={currentPositionNoteIds} onNoteClick={handleNoteClick}
               />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-10 flex flex-col justify-between backdrop-blur-sm">
                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Sequence Stats</div>
                        <h3 className="text-2xl font-black">{phrasingPattern} Pattern</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Generated {dynamicSequence.length} intervals for Position {currentPosition}. The visual echo helps visualize phrasing contours in real-time.</p>
                     </div>
                     <div className="flex items-center gap-4 mt-10">
                        <button onClick={() => setIsLooping(!isLooping)} className={`p-4 rounded-2xl border transition-all ${isLooping ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-xl' : 'border-white/5 text-slate-500'}`} title="Loop Pattern"><Repeat className={`w-6 h-6 ${isLooping ? 'animate-spin-slow' : ''}`} /></button>
                        <button onClick={playAutoSequence} className={`flex-grow flex items-center justify-center gap-4 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 ${isPlayingScale ? 'animate-pulse' : ''}`}>
                           {isPlayingScale ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                           {isPlayingScale ? 'Stop Lab' : 'Execute Pattern'}
                        </button>
                     </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-[2rem] p-10 relative overflow-hidden group shadow-3xl">
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                           <BrainCircuit className="w-5 h-5 text-indigo-400" />
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Phrasing Insights</span>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed font-medium">
                           {loadingLesson ? (
                             <div className="flex items-center gap-3 py-4">
                                <RotateCcw className="w-4 h-4 animate-spin text-indigo-400" />
                                <span className="text-[11px] uppercase font-black tracking-[0.3em] opacity-50">Decoding Lick Structure...</span>
                             </div>
                           ) : (
                             <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">{lesson}</div>
                           )}
                        </div>
                        <button onClick={fetchLesson} className="text-[10px] font-black text-indigo-400 uppercase border-b border-indigo-500/30 pb-1 hover:text-indigo-300 transition-colors">Refresh Insight</button>
                     </div>
                     <Sparkles className="absolute -bottom-10 -right-10 w-40 h-40 text-indigo-500/10 group-hover:scale-110 transition-transform duration-1000" />
                  </div>
               </div>
            </div>
          ) : (
            <>
              {phase === 'PREVIEW' && (
                <div className="bg-gradient-to-br from-slate-900/60 to-slate-950 border border-white/5 rounded-[3rem] p-16 relative overflow-hidden shadow-3xl group">
                   <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-amber-500/5 blur-[150px] rounded-full group-hover:bg-amber-500/10 transition-all duration-1000" />
                   <div className="relative z-10 max-w-2xl">
                      <span className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                         <Award className="w-4 h-4" /> Module {currentChapterIndex + 1}
                      </span>
                      <h2 className="text-7xl font-black mb-8 leading-[1.05] tracking-tight text-white">{currentChapter.title}</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-14 font-medium opacity-80">{currentChapter.description}</p>
                      <div className="flex flex-wrap gap-6">
                         <button onClick={() => setPhase('LEARNING')} className="flex items-center gap-4 px-12 py-6 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-amber-500/40">
                            <PlayCircle className="w-7 h-7" /> Enter Masterclass
                         </button>
                         <button onClick={() => setPhase('CHALLENGE')} className="flex items-center gap-4 px-10 py-6 bg-slate-800 text-slate-100 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5">
                            Skill Assessment
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {phase !== 'PREVIEW' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex items-center bg-slate-900/60 p-2 rounded-2xl border border-white/5 w-fit backdrop-blur-xl shadow-2xl">
                      <button onClick={() => setPhase('PREVIEW')} className="p-3 text-slate-500 hover:text-slate-300"><ChevronLeft className="w-6 h-6" /></button>
                      <div className="w-[1px] h-6 bg-white/10 mx-3" />
                      <button onClick={() => setPhase('LEARNING')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === 'LEARNING' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}>Masterclass</button>
                      <button onClick={() => setPhase('CHALLENGE')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${phase === 'CHALLENGE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>Assessment</button>
                   </div>
                   
                   <Fretboard 
                     rootNote={rootNote} scaleType={scaleType} showIntervals={showIntervals} 
                     fretMarkerType={fretMarkerType} activeNoteId={activeNoteId} 
                     noteTrail={noteTrail}
                     positionNoteIds={currentPositionNoteIds} onNoteClick={handleNoteClick}
                     hideLabels={phase === 'CHALLENGE'} successNoteIds={successNoteIds} 
                     errorNoteId={errorNoteId} highlightInterval={phase === 'LEARNING' ? currentStep?.targetInterval : null}
                   />

                   {phase === 'LEARNING' && (
                      <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-12 backdrop-blur-sm shadow-inner">
                         <div className="prose prose-invert prose-lg max-w-none selection:bg-amber-500/20">
                            {loadingLesson ? (
                              <div className="py-20 flex flex-col items-center gap-6">
                                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                                   <div className="absolute inset-0 bg-amber-500 animate-loading" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-[0.5em] text-slate-600">Analyzing Theory Geometry...</span>
                              </div>
                            ) : (
                              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-medium animate-in fade-in duration-700">{lesson}</div>
                            )}
                         </div>
                      </div>
                   )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <footer className="max-w-7xl mx-auto w-full mt-auto py-16 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-4 opacity-30">
            <Music className="w-6 h-6 text-amber-500" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Pentatonic Pro v1.6 • Lab Environment Enhanced</div>
        </div>
      </footer>
    </div>
  );
};

export default App;