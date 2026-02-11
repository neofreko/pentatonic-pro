import React, { useEffect, useMemo } from 'react';
import { Play, Square, Music, Timer, ChevronDown } from 'lucide-react';
import { BackingTrack, ScaleType } from '../types';

interface BackingTrackPlayerProps {
  rootNote: string;
  scaleType: ScaleType;
  audioPreset: 'clean' | 'crunch' | 'dreamy';
  isPlaying: boolean;
  currentBeat: number;
  currentBar: number;
  tempo: number;
  currentTrack: BackingTrack | null;
  loadTrack: (track: BackingTrack) => void;
  togglePlay: () => void;
  setTempo: (bpm: number) => void;
  playNoodle: (sample?: any[]) => void;
  availableTracks: BackingTrack[];
}

export const BackingTrackPlayer: React.FC<BackingTrackPlayerProps> = ({
  rootNote,
  scaleType,
  audioPreset,
  isPlaying,
  currentBeat,
  currentBar,
  tempo,
  currentTrack,
  loadTrack,
  togglePlay,
  setTempo,
  playNoodle,
  availableTracks
}) => {

  // Filter tracks by mode
  const filteredTracks = useMemo(() => {
    return availableTracks.filter(t => {
      if (t.mode === 'blues') return true; // Blues works for both
      return t.mode === scaleType;
    });
  }, [availableTracks, scaleType]);

  // Auto-select first track if current one is filtered out or nothing selected
  useEffect(() => {
    if (filteredTracks.length > 0) {
      if (!currentTrack || !filteredTracks.find(t => t.id === currentTrack.id)) {
        loadTrack(filteredTracks[0]);
      }
    }
  }, [filteredTracks, currentTrack, loadTrack]);

  // Helper for transposed labels
  const getTransposedChord = (originalChordRoot: string) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (!currentTrack) return originalChordRoot;

    const trackKeyIndex = notes.indexOf(currentTrack.key.toUpperCase().replace('S', '#'));
    const targetKeyIndex = notes.indexOf(rootNote.toUpperCase().replace('S', '#'));
    const chordRootIndex = notes.indexOf(originalChordRoot.toUpperCase().replace('S', '#'));

    if (trackKeyIndex === -1 || targetKeyIndex === -1 || chordRootIndex === -1) return originalChordRoot;

    const interval = (targetKeyIndex - trackKeyIndex + 12) % 12;
    const transposedRootIndex = (chordRootIndex + interval) % 12;
    return notes[transposedRootIndex];
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Music className={`w-6 h-6 ${isPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Backing Track</h3>
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>
            <div className="relative group">
              <select
                className="bg-transparent text-white font-bold text-lg appearance-none pr-8 cursor-pointer outline-none hover:text-indigo-400 transition-colors"
                value={currentTrack?.id || ''}
                onChange={(e) => {
                  const track = filteredTracks.find(t => t.id === e.target.value);
                  if (track) loadTrack(track);
                }}
              >
                {filteredTracks.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900">{t.name} ({t.mode.charAt(0).toUpperCase() + t.mode.slice(1)})</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1">Tempo</span>
            <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5">
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                className="bg-transparent w-12 text-center font-mono text-sm font-bold text-indigo-400 outline-none"
              />
              <span className="text-[10px] font-bold text-slate-600">BPM</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1">Bar / Beat</span>
            <div className="flex items-center gap-2 font-mono text-lg font-black text-white bg-slate-950/50 px-5 py-1.5 rounded-xl border border-white/5">
              <span className={isPlaying ? 'text-white' : 'text-slate-700'}>{currentBar}</span>
              <span className="text-slate-800">:</span>
              <span className={isPlaying ? 'text-indigo-500' : 'text-slate-700'}>{(currentBeat % (currentTrack?.timeSignature[0] || 4)) + 1}</span>
            </div>
          </div>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-30 disabled:grayscale ${isPlaying
              ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-400'
              : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500'
              }`}
          >
            {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
        </div>
      </div>

      {currentTrack && (
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-500 italic">"{currentTrack.description}" — Playing in <span className="text-indigo-400 font-bold">{rootNote} {scaleType}</span></p>
              <button
                onClick={() => playNoodle()}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors w-fit group"
              >
                <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                Hear Sample Melody
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-[60%] scrollbar-hide">
              {currentTrack.progression.map((chord, i) => {
                const beatsPerBar = currentTrack.timeSignature[0];
                const currentBarIndex = Math.floor(currentBeat / beatsPerBar);
                const isActive = isPlaying && i === currentBarIndex;
                const transposedRoot = getTransposedChord(chord.root);

                return (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap border ${isActive ? 'bg-indigo-500 text-white border-indigo-400 scale-110 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 text-slate-600 border-white/5'
                      }`}
                  >
                    {transposedRoot}{chord.quality === 'major' ? '' : chord.quality === 'minor' ? 'm' : chord.quality}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};