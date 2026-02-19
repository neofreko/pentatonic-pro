import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NOTES, MIDI_TUNING, TUNING } from './constants';
import { ScaleType, TutorialStep } from './types';
import { PENTATONIC_POSITIONS } from './data/positions'; // Imported from new data file
import Fretboard from './components/Fretboard';
import { SyllabusSidebar } from './components/SyllabusSidebar';
import { useSyllabus } from './hooks/useSyllabus';
import { useBackingTrack } from './hooks/useBackingTrack';
import { NOODLE_LIBRARY } from './data/noodleLibrary';
import { 
  Music, Sparkles, ChevronRight, Play, Trophy, PlayCircle, Award, 
  ChevronLeft, RotateCcw, Activity, Loader2, X, Key, 
  LogOut, Zap, Play as PlayIcon, Bell, Waves, Timer, Repeat, Square,
  BrainCircuit, ArrowRightLeft
} from 'lucide-react';
import { initAudio, setBpm, startSequence, stopActiveSequence, toggleMetronome, toggleDrone } from './utils/audio';
import { initiateOpenRouterLogin } from './utils/openRouterAuth';

type FretMarkerType = 'number' | 'note';
type PhrasingPattern = 'LINEAR' | 'TRIPLETS' | 'QUARTETS' | 'STRING_SKIP';

const App: React.FC = () => {
  const [rootNote, setRootNote] = useState(() => localStorage.getItem('root_note') || 'A');
  const [scaleType, setScaleType] = useState<ScaleType>(() => (localStorage.getItem('scale_type') as ScaleType) || 'minor');
  const [currentPosition, setCurrentPosition] = useState<number>(() => {
    const saved = localStorage.getItem('current_position');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('root_note', rootNote);
  }, [rootNote]);

  useEffect(() => {
    localStorage.setItem('scale_type', scaleType);
  }, [scaleType]);

  useEffect(() => {
    localStorage.setItem('current_position', currentPosition.toString());
  }, [currentPosition]);

  const [showIntervals, setShowIntervals] = useState(true);
  const [fretMarkerType, setFretMarkerType] = useState<FretMarkerType>('number');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [hintNoteId, setHintNoteId] = useState<string | null>(null);
  const [noteTrail, setNoteTrail] = useState<string[]>([]);
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [audioPreset, setAudioPresetState] = useState<'clean' | 'crunch' | 'dreamy'>('clean');
  
  // Performance states from remote
  const [bpm, setBpmState] = useState(80);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isDroneOn, setIsDroneOn] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [phrasingPattern, setPhrasingPattern] = useState<PhrasingPattern>('LINEAR');

  const activeNoteTimeoutRef = useRef<number | null>(null);

  const {
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
  } = useSyllabus(rootNote, scaleType, currentPosition);

  const [userQuery, setUserQuery] = useState('');

  const {
    playNoodle,
  } = useBackingTrack();

  const [successNoteIds, setSuccessNoteIds] = useState<string[]>([]);
  const [errorNoteId, setErrorNoteId] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState(false);

  // Performance handlers
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

  const rootMidi = useMemo(() => {
    const idx = NOTES.indexOf(rootNote);
    return MIDI_TUNING[5] + idx; 
  }, [rootNote]);

  const handleDroneToggle = () => {
    const nextState = !isDroneOn;
    setIsDroneOn(nextState);
    initAudio();
    toggleDrone(rootMidi, nextState);
  };

  useEffect(() => {
    if (isDroneOn) toggleDrone(rootMidi, true);
  }, [rootMidi, isDroneOn]);

  const [showSettings, setShowSettings] = useState(false);

  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('openrouter_api_key') || '');
  const [tempModel, setTempModel] = useState(localStorage.getItem('openrouter_model') || 'google/gemini-2.0-flash-001');
  const [isJamming, setIsJamming] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!tempApiKey) {
      setTestResult({ success: false, message: "Please enter an API key first." });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const { testOpenRouterConnection } = await import('./services/aiService');
      const result = await testOpenRouterConnection(tempApiKey, tempModel);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const currentPositionNoteIds = useMemo(() => {
    const rootIdx = NOTES.indexOf(rootNote);
    const lowEOpenIdx = TUNING[5];
    const baseFret = (rootIdx - lowEOpenIdx + 12) % 12;

    const posData = PENTATONIC_POSITIONS[scaleType][currentPosition as keyof typeof PENTATONIC_POSITIONS['minor']];
    const ids = new Set<string>();

    posData.forEach(([sIdx, frets]: [number, number[]]) => {
      frets.forEach(fOffset => {
        let f = baseFret + fOffset;
        while (f < 0) f += 12;
        while (f > 24) f -= 12;
        ids.add(`${sIdx}-${f}`);
      });
    });
    return ids;
  }, [rootNote, scaleType, currentPosition]);

  // Phrasing Lab logic from remote
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
    startSequence(dynamicSequence, (id: string | null) => {
      setActiveNoteId(id);
      if (id) {
        setNoteTrail(prev => [id, ...prev].slice(0, 4));
      }
    }, () => { 
      if (!isLooping) setIsPlayingScale(false); 
    }, isLooping);
  };

  const handleNoteClick = useCallback((s: number, f: number, _noteName: string, interval: string) => {
    initAudio();
    const noteId = `${s}-${f}`;
    setActiveNoteId(noteId);
    setNoteTrail(prev => [noteId, ...prev].slice(0, 4));
    if (activeNoteTimeoutRef.current) window.clearTimeout(activeNoteTimeoutRef.current);
    activeNoteTimeoutRef.current = window.setTimeout(() => setActiveNoteId(null), 1000);

    if (phase === 'CHALLENGE') {
      if (challengeComplete || successNoteIds.includes(noteId)) return;
      if (interval === currentChapter?.challenge?.targetInterval) {
        const newSuccess = [...successNoteIds, noteId];
        setSuccessNoteIds(newSuccess);
        if (currentChapter?.challenge && newSuccess.length >= currentChapter.challenge.requiredCount) {
          setChallengeComplete(true);
          if (currentChapter?.id && !completedChapters.includes(currentChapter.id)) {
            setCompletedChapters(prev => [...prev, currentChapter.id]);
          }
        }
      } else {
        setErrorNoteId(noteId);
        setTimeout(() => setErrorNoteId(null), 500);
      }
    }
  }, [phase, challengeComplete, successNoteIds, currentChapter, completedChapters]);

  const startChallenge = () => {
    setPhase('CHALLENGE');
    setChallengeComplete(false);
    setSuccessNoteIds([]);
    setErrorNoteId(null);
  };

  const backToPreview = () => {
    setPhase('PREVIEW');
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-3xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Key className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold">AI Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Authentication</label>
                {tempApiKey ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-green-500">Authenticated</span>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('openrouter_api_key');
                          setTempApiKey('');
                          setTestResult(null);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl px-5 py-4 border border-slate-800">
                      <div className="text-[8px] font-black uppercase text-slate-600 mb-1">Active API Key</div>
                      <div className="text-xs text-slate-400 font-mono truncate">{tempApiKey.substring(0, 10)}...{tempApiKey.substring(tempApiKey.length - 10)}</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={initiateOpenRouterLogin}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 group"
                  >
                    <div className="p-1.5 bg-white/10 rounded-lg group-hover:rotate-12 transition-transform">
                      <Key className="w-4 h-4" />
                    </div>
                    Login with OpenRouter
                  </button>
                )}
                <p className="text-[10px] text-slate-600 ml-1 leading-relaxed">
                  Login to grant access to your OpenRouter account. This is the recommended secure way to connect.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preferred Model</label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (Fastest)</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (Smarts)</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                  <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>
                <p className="text-[10px] text-slate-600 ml-1 leading-relaxed">
                  Different models may have different costs and speeds.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${isTesting ? 'border-slate-800 text-slate-700' : 'border-slate-800 text-slate-400 hover:text-amber-500 hover:border-amber-500/50'}`}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Activity className="w-3 h-3" /> Test Connection
                    </>
                  )}
                </button>
                {testResult && (
                  <div className={`mt-3 px-4 py-2 rounded-xl text-[10px] font-bold animate-in fade-in slide-in-from-top-2 ${testResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-600 ml-1 leading-relaxed">
                Your key is stored locally in your browser (or loaded from .env). Get one at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">openrouter.ai</a>.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    localStorage.setItem('openrouter_api_key', tempApiKey);
                    localStorage.setItem('openrouter_model', tempModel);
                    setShowSettings(false);
                    setTestResult(null);
                  }}
                  className="flex-grow py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-amber-500/20"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setTestResult(null);
                  }}
                  className="px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-12 flex-grow">
        <SyllabusSidebar
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          completedChapters={completedChapters}
          onSelectChapter={(idx) => selectChapter(idx, (type) => setScaleType(type))}
          phasingLabActive={phase === 'PHRASING_LAB'}
          onPhrasingLabClick={() => { setPhase('PHRASING_LAB'); resetSequence(); fetchLesson(undefined, 'PHRASING', phrasingPattern); }}
          loading={loadingChapters}
        />

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
                         onClick={() => { setPhrasingPattern(p.id as PhrasingPattern); resetSequence(); fetchLesson(undefined, 'PHRASING', p.id); }}
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
                        <button onClick={() => fetchLesson(undefined, 'PHRASING', phrasingPattern)} className="text-[10px] font-black text-indigo-400 uppercase border-b border-indigo-500/30 pb-1 hover:text-indigo-300 transition-colors">Refresh Insight</button>
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
                      <h2 className="text-7xl font-black mb-8 leading-[1.05] tracking-tight text-white">{currentChapter?.title}</h2>
                      <p className="text-xl text-slate-400 leading-relaxed mb-14 font-medium opacity-80">{currentChapter?.description}</p>
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
                     hintNoteId={hintNoteId}
                   />

                   <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                      <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Box Position</label>
                         <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map(p => (
                               <button 
                                 key={p} onClick={() => { setCurrentPosition(p); resetSequence(); }}
                                 className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${currentPosition === p ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                               >
                                 {p}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Visuals</label>
                         <button onClick={() => setShowIntervals(!showIntervals)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${showIntervals ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>Intervals</button>
                         <button onClick={() => setFretMarkerType(fretMarkerType === 'number' ? 'note' : 'number')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors`}>{fretMarkerType === 'number' ? 'Fret #' : 'Notes'}</button>
                      </div>
                   </div>

                   {phase === 'LEARNING' && currentStep && !isJamming && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 animate-in slide-in-from-left-8 duration-500">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                            <Sparkles className="w-6 h-6 text-slate-950" />
                          </div>
                          <div>
                            <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Interactive Guide</h4>
                            <h5 className="text-2xl font-black text-white mb-4 tracking-tight">{currentStep.title}</h5>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-2xl">{currentStep.instruction}</p>
                            <div className="mt-8 flex items-center gap-4">
                              {currentStep.noodleId ? (
                                <button
                                  onClick={() => {
                                    const sample = (NOODLE_LIBRARY as any)[currentStep.noodleId!];
                                    if (sample) {
                                      playNoodle(sample);
                                      setTutorialSuccess(true);
                                    }
                                  }}
                                  className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 group"
                                >
                                  <PlayIcon className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                                  {currentStep.actionText}
                                </button>
                              ) : (
                                <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400">
                                  Goal: {currentStep.actionText}
                                </div>
                              )}
                              {tutorialSuccess && (
                                <button
                                  onClick={() => {
                                    if (activeStepIndex < currentChapter.tutorialSteps.length - 1) {
                                      setActiveStepIndex(activeStepIndex + 1);
                                      setTutorialSuccess(false);
                                    } else {
                                      startChallenge();
                                    }
                                  }}
                                  className="px-8 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 animate-in zoom-in"
                                >
                                  {activeStepIndex < currentChapter.tutorialSteps.length - 1 ? 'Next Step' : 'Finish Lesson'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                   )}

                   {phase === 'CHALLENGE' && currentChapter?.challenge && !isJamming && (
                      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div className="w-full">
                            <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Proficiency Challenge</h4>
                            <h5 className="text-2xl font-black text-white mb-4 tracking-tight">
                              {challengeComplete ? "Challenge Unlocked!" : "Prove Your Skills"}
                            </h5>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-2xl">
                              {currentChapter.challenge.description}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400">
                                <span>Progress: </span>
                                <span className={`text-lg ${challengeComplete ? 'text-green-500' : 'text-indigo-500'}`}>
                                  {successNoteIds.length}
                                </span>
                                <span className="text-slate-600">/</span>
                                <span>{currentChapter?.challenge?.requiredCount}</span>
                              </div>

                              {challengeComplete && (
                                <button
                                  onClick={backToPreview}
                                  className="px-8 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 animate-in zoom-in"
                                >
                                  Complete Chapter
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                   )}

                   {phase === 'LEARNING' && (
                      <div className="bg-slate-900/30 border border-slate-800/60 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-150 shadow-3xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                            <Activity className="w-4 h-4 text-amber-500" />
                            Lesson: {currentChapter?.title || 'Masterclass'}
                          </h4>
                          <button 
                            onClick={() => {
                              fetchLesson(userQuery);
                              setUserQuery('');
                            }} 
                            className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 transition-all hover:text-amber-500"
                            title="Re-generate with query"
                          >
                            <Sparkles className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-12 prose prose-invert prose-lg max-w-none font-medium leading-relaxed selection:bg-amber-500/20">
                          {loadingLesson ? (
                            <div className="flex flex-col items-center py-24 gap-6">
                              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-amber-500 animate-loading shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Personalizing Theory Lesson...</p>
                            </div>
                          ) : (
                            <div className="space-y-10">
                              {lesson ? (
                                <div className="text-slate-400 whitespace-pre-wrap leading-loose animate-in fade-in duration-700">{lesson}</div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                  <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                                    <Sparkles className="w-8 h-8 text-slate-700" />
                                  </div>
                                  <div className="max-w-xs">
                                    <h5 className="text-white font-bold mb-1">AI Theory Tutor</h5>
                                    <p className="text-slate-500 text-xs">Your personal instructor is ready. Ask anything about this chapter or click below for a standard lesson.</p>
                                  </div>
                                </div>
                              )}

                              <div className="pt-8 border-t border-white/5">
                                <div className="bg-slate-950/40 rounded-2xl p-6 border border-white/5 focus-within:border-amber-500/50 transition-all">
                                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 block px-1">
                                    {lesson ? "Ask a Follow-up Question" : "Ask the AI Tutor"}
                                  </label>
                                  <div className="flex flex-col sm:flex-row gap-6">
                                    <textarea
                                      value={userQuery}
                                      onChange={(e) => setUserQuery(e.target.value)}
                                      placeholder={lesson ? "Ask for clarification, examples, or more details..." : "e.g. 'How do I use this in a blues solo?' or 'Explain the b3 interval...'"}
                                      className="flex-grow bg-transparent border-none text-base text-slate-300 outline-none resize-none h-20 placeholder:text-slate-700"
                                    />
                                    <button 
                                      onClick={() => {
                                        fetchLesson(userQuery);
                                        setUserQuery('');
                                      }}
                                      className="self-end px-8 py-4 bg-amber-500 text-slate-950 rounded-[1.2rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3 whitespace-nowrap"
                                    >
                                      <Sparkles className="w-5 h-5" /> 
                                      {lesson ? "Ask Tutor" : "Generate Lesson"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
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
