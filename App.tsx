
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NOTES, MIDI_TUNING, TUNING } from './constants';
import { ScaleType, TutorialStep } from './types';
import { PENTATONIC_POSITIONS } from './data/positions'; // Imported from new data file
import Fretboard from './components/Fretboard';
import { useSyllabus } from './hooks/useSyllabus';
import { Music, Sparkles, ChevronRight, Play, Volume2, CheckCircle2, ListChecks, Trophy, GraduationCap, PlayCircle, Award, Hash, Type as TypeIcon, ChevronLeft, RotateCcw, Activity, Loader2 } from 'lucide-react';
import { playNote, setAudioPreset } from './utils/audio';

type FretMarkerType = 'number' | 'note';

const App: React.FC = () => {
  const [rootNote, setRootNote] = useState('A');
  const [scaleType, setScaleType] = useState<ScaleType>('minor');
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [showIntervals, setShowIntervals] = useState(true);
  const [fretMarkerType, setFretMarkerType] = useState<FretMarkerType>('number');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [audioPreset, setAudioPresetState] = useState<'clean' | 'crunch' | 'dreamy'>('clean');

  const handlePresetChange = (preset: 'clean' | 'crunch' | 'dreamy') => {
    setAudioPresetState(preset);
    setAudioPreset(preset);
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
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

  const [successNoteIds, setSuccessNoteIds] = useState<string[]>([]);
  const [errorNoteId, setErrorNoteId] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState(false);

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

  const fullSequence = useMemo(() => {
    const notesInBox = Array.from(currentPositionNoteIds).map((id: string) => {
      const [s, f] = id.split('-').map(Number);
      return { s, f, midi: MIDI_TUNING[s] + f };
    }).sort((a, b) => a.midi - b.midi);

    if (notesInBox.length < 3) return [];

    const sequence: { s: number, f: number, midi: number, pair: number[], tripletIdx: number }[] = [];

    // ASCENDING TRIPLET GROUPS (UP: 1-2-3, 2-3-4, etc.)
    for (let i = 0; i < notesInBox.length - 2; i++) {
      const triplet = [notesInBox[i], notesInBox[i + 1], notesInBox[i + 2]];
      const activeStrings = Array.from(new Set(triplet.map(n => n.s)));
      triplet.forEach((note, idx) => {
        sequence.push({ ...note, pair: activeStrings, tripletIdx: idx + 1 });
      });
    }

    // DESCENDING TRIPLET GROUPS (DOWN: Top-Mid-Bottom, Mid-Bottom-Next...)
    for (let i = notesInBox.length - 1; i >= 2; i--) {
      const triplet = [notesInBox[i], notesInBox[i - 1], notesInBox[i - 2]];
      const activeStrings = Array.from(new Set(triplet.map(n => n.s)));
      triplet.forEach((note, idx) => {
        sequence.push({ ...note, pair: activeStrings, tripletIdx: idx + 1 });
      });
    }

    return sequence;
  }, [currentPositionNoteIds]);

  const stepForward = useCallback(() => {
    if (currentStepIndex < fullSequence.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const note = fullSequence[nextIdx];
      setActiveNoteId(`${note.s}-${note.f}`);
      playNote(note.midi);
    }
  }, [currentStepIndex, fullSequence]);

  const stepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      const nextIdx = currentStepIndex - 1;
      setCurrentStepIndex(nextIdx);
      const note = fullSequence[nextIdx];
      setActiveNoteId(`${note.s}-${note.f}`);
      playNote(note.midi);
    }
  }, [currentStepIndex, fullSequence]);

  const resetSequence = () => {
    setCurrentStepIndex(-1);
    setActiveNoteId(null);
  };

  const playAutoSequence = async () => {
    if (isPlayingScale) return;
    setIsPlayingScale(true);
    resetSequence();

    for (let i = 0; i < fullSequence.length; i++) {
      setCurrentStepIndex(i);
      const item = fullSequence[i];
      setActiveNoteId(`${item.s}-${item.f}`);
      playNote(item.midi);
      await new Promise(r => setTimeout(r, 320));
    }

    setActiveNoteId(null);
    setIsPlayingScale(false);
  };

  const startLesson = () => {
    setPhase('LEARNING');
    setActiveStepIndex(0);
    setTutorialSuccess(false);
  };

  const startChallenge = () => {
    setPhase('CHALLENGE');
    setChallengeComplete(false);
    setSuccessNoteIds([]);
    setErrorNoteId(null);
  };

  const backToLearning = () => {
    setPhase('LEARNING');
    setSuccessNoteIds([]);
    setErrorNoteId(null);
    setActiveStepIndex(0);
    setTutorialSuccess(false);
  };

  const backToPreview = () => {
    setPhase('PREVIEW');
  };

  const handleNoteClick = (s: number, f: number, noteName: string, interval: string) => {
    const noteId = `${s}-${f}`;
    setActiveNoteId(noteId);
    if (activeNoteTimeoutRef.current) window.clearTimeout(activeNoteTimeoutRef.current);
    activeNoteTimeoutRef.current = window.setTimeout(() => setActiveNoteId(null), 1000);

    if (phase === 'CHALLENGE') {
      if (challengeComplete) return;
      if (successNoteIds.includes(noteId)) return;

      if (interval === currentChapter.challenge.targetInterval) {
        const newSuccess = [...successNoteIds, noteId];
        setSuccessNoteIds(newSuccess);
        if (newSuccess.length >= currentChapter.challenge.requiredCount) {
          setChallengeComplete(true);
          if (!completedChapters.includes(currentChapter.id)) {
            setCompletedChapters(prev => [...prev, currentChapter.id]);
          }
        }
      } else {
        setErrorNoteId(noteId);
        setTimeout(() => setErrorNoteId(null), 500);
      }
      return;
    }

    if (phase === 'LEARNING' && currentStep?.targetInterval) {
      if (interval === currentStep.targetInterval) {
        setTutorialSuccess(true);
      } else {
        setErrorNoteId(`${s}-${f}`);
        setTimeout(() => setErrorNoteId(null), 500);
      }
    }
  };

  // selectChapter is now provided by useSyllabus hook

  useEffect(() => {
    if (phase === 'LEARNING') {
      fetchLesson();
    }
  }, [phase, fetchLesson]);

  const currentStepData = currentStepIndex >= 0 ? fullSequence[currentStepIndex] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col font-sans selection:bg-amber-500/30">
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

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-12 flex-grow">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sticky top-8 backdrop-blur-sm">
            <h2 className="font-black flex items-center gap-2 text-slate-400 mb-8 uppercase tracking-widest text-[10px]">
              <ListChecks className="w-4 h-4 text-amber-500" /> Syllabus Progress
            </h2>
            <div className="space-y-4">
              {loadingChapters ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : (
                chapters.map((ch, idx) => {
                  const isActive = currentChapterIndex === idx;
                  const isCompleted = completedChapters.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => selectChapter(idx, (type) => setScaleType(type))}
                      className={`w-full text-left group flex items-center gap-4 transition-all ${isActive ? 'translate-x-2' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-lg ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-amber-500 text-slate-950 scale-110' : 'bg-slate-800 text-slate-600 group-hover:bg-slate-700 group-hover:text-slate-400'
                        }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className={`text-sm font-bold transition-colors truncate ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-300'}`}>
                          {ch.title}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate uppercase font-bold tracking-widest mt-0.5">{ch.focus}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-10 pb-20">
          {phase !== 'PREVIEW' && (
            <div className="flex items-center bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50 w-fit backdrop-blur-md">
              <button onClick={backToPreview} className="px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors" title="Back to Overview">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-[1px] h-4 bg-slate-800 mx-2" />
              <button onClick={backToLearning} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 'LEARNING' ? 'bg-amber-500 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                <GraduationCap className="w-4 h-4" /> Lesson
              </button>
              <button onClick={startChallenge} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${phase === 'CHALLENGE' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                <Trophy className="w-4 h-4" /> Challenge
              </button>
            </div>
          )}

          {phase === 'PREVIEW' && currentChapter && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-12 relative overflow-hidden shadow-3xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-amber-500/20">
                    <Award className="w-3 h-3" /> Chapter {currentChapterIndex + 1}
                  </span>
                  <h2 className="text-6xl font-black mb-8 leading-tight tracking-tighter">{currentChapter.title}</h2>
                  <p className="text-xl text-slate-400 leading-relaxed mb-12 font-medium">{currentChapter.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={startLesson} className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20 group">
                      <PlayCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Start Masterclass
                    </button>
                    <button onClick={startChallenge} className="flex items-center gap-3 px-8 py-5 bg-slate-800 text-slate-100 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all border border-slate-700">
                      Jump to Challenge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase !== 'PREVIEW' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <section className="space-y-6 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Scale Box Visualizer</h3>
                      <p className="text-xs text-slate-400 font-bold">{rootNote} {scaleType === 'minor' ? 'Minor' : 'Major'} Pentatonic</p>
                    </div>
                    {currentStepData && (
                      <div className="flex items-center gap-3 bg-amber-500/20 border border-amber-500/50 px-4 py-2 rounded-2xl animate-in zoom-in duration-300 shadow-lg shadow-amber-500/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-amber-500/60 leading-none mb-0.5">Scale Progress</span>
                          <span className="text-xs font-black text-amber-500 leading-none">Step {currentStepIndex + 1} of {fullSequence.length}</span>
                        </div>
                        <div className="w-[1px] h-6 bg-amber-500/20" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-amber-500/60 leading-none mb-0.5">Active Run</span>
                          <span className="text-xs font-black text-amber-500 leading-none uppercase tracking-tighter">
                            {currentStepIndex < fullSequence.length / 2 ? 'Ascending' : 'Descending'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
                      <button
                        onClick={() => setFretMarkerType('number')}
                        className={`p-2.5 rounded-xl transition-all ${fretMarkerType === 'number' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Fret Numbers"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFretMarkerType('note')}
                        className={`p-2.5 rounded-xl transition-all ${fretMarkerType === 'note' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Fret Notes"
                      >
                        <TypeIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
                      <button
                        onClick={() => handlePresetChange('clean')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${audioPreset === 'clean' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Clean
                      </button>
                      <button
                        onClick={() => handlePresetChange('crunch')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${audioPreset === 'crunch' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Crunch
                      </button>
                      <button
                        onClick={() => handlePresetChange('dreamy')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${audioPreset === 'dreamy' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Space
                      </button>
                    </div>

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
                      <button onClick={stepForward} disabled={currentStepIndex >= fullSequence.length - 1} className="p-2.5 text-slate-400 hover:text-amber-500 disabled:opacity-20 transition-colors">
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

                <Fretboard
                  rootNote={rootNote}
                  scaleType={scaleType}
                  showIntervals={showIntervals}
                  fretMarkerType={fretMarkerType}
                  activeNoteId={activeNoteId}
                  activeStrings={currentStepData?.pair}
                  positionNoteIds={currentPositionNoteIds}
                  onNoteClick={handleNoteClick}
                  hideLabels={phase === 'CHALLENGE'}
                  successNoteIds={successNoteIds}
                  errorNoteId={errorNoteId}
                  highlightInterval={phase === 'LEARNING' ? currentStep?.targetInterval : null}
                />
              </section>

              {
                phase === 'LEARNING' && (
                  <div className="bg-slate-900/30 border border-slate-800/60 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-150 shadow-3xl">
                    <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3"><Activity className="w-4 h-4 text-amber-500" /> Lesson: Triplets on 2-Note Strings</h4>
                      <button onClick={fetchLesson} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-all hover:text-amber-500"><Sparkles className="w-4 h-4" /></button>
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
                )
              }
            </div >
          )}
        </main >
      </div >
      <footer className="max-w-7xl mx-auto w-full mt-auto py-12 border-t border-slate-900 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]"><Music className="w-3 h-3" /> Pentatonic Pro <span className="text-slate-800">•</span> Visual Theory Engine</div>
      </footer>
    </div >
  );
};

export default App;
