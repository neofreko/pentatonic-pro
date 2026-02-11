import React, { useState, useRef, useEffect } from 'react';
import { Play, Activity, Sliders, Waves } from 'lucide-react';

export const KarplusStrongLab: React.FC = () => {
  const [frequency, setFrequency] = useState(220); // A3
  const [damping, setDamping] = useState(0.5);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const synthesizeSound = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    setIsSynthesizing(true);

    const sampleRate = ctx.sampleRate;
    const duration = 2.0;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // 1. BUFFER INITIALIZATION (The "String" length)
    const N = Math.round(sampleRate / frequency);
    
    // 2. EXCITATION (White Noise Burst)
    for (let i = 0; i < N; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // 3. THE FEEDBACK LOOP (Karplus-Strong Algorithm)
    // Python equivalent: y[n] = damping * 0.5 * (y[n-N] + y[n-(N+1)])
    for (let i = N; i < data.length; i++) {
      // Simple moving average acts as a low-pass filter
      const average = 0.5 * (data[i - N] + data[i - (N - 1)]);
      // Damping Coefficient simulates energy loss
      data[i] = average * (0.99 + (damping * 0.009));
    }

    // Playback
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Add a small gain to prevent clipping
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start();
    source.onended = () => setIsSynthesizing(false);
  };

  return (
    <div className="mt-12 bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Waves className="w-32 h-32 text-indigo-500" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Classic Karplus-Strong Lab</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Python Synth Reproduction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Frequency (Hz)</label>
                <span className="text-sm font-mono text-indigo-400 font-bold">{frequency} Hz</span>
              </div>
              <input 
                type="range" min="80" max="880" step="1"
                value={frequency} 
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Damping (Sustain)</label>
                <span className="text-sm font-mono text-indigo-400 font-bold">{Math.round(damping * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={damping} 
                onChange={(e) => setDamping(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <button
              onClick={synthesizeSound}
              disabled={isSynthesizing}
              className={`w-full py-6 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 ${
                isSynthesizing 
                ? 'bg-slate-800 text-slate-500' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'
              }`}
            >
              <Play className={`w-6 h-6 ${isSynthesizing ? 'animate-pulse' : 'fill-current'}`} />
              <span className="text-sm font-black uppercase tracking-[0.2em]">
                {isSynthesizing ? 'Synthesizing...' : 'Trigger Physical Model'}
              </span>
            </button>
            
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Algorithm</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                {`# The Python logic:
N = sample_rate / frequency
data[i] = 0.5 * (data[i-N] + data[i-(N-1)]) * damping`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
