
import { useState, useEffect, useRef, useCallback } from 'react';
import { BackingTrackService } from '../services/backingTrackService';
import { BackingTrack, SequencerState } from '../types';
import { BACKING_TRACKS } from '../data/backingTracks';

export const useBackingTrack = () => {
  const serviceRef = useRef<BackingTrackService | null>(null);
  const [state, setState] = useState<SequencerState>({
    isPlaying: false,
    currentBeat: 0,
    currentBar: 1,
    totalBeats: 0,
    tempo: 120
  });
  const [currentTrack, setCurrentTrack] = useState<BackingTrack | null>(null);

  useEffect(() => {
    serviceRef.current = new BackingTrackService();
    return () => {
      serviceRef.current?.stop();
    };
  }, []);

  // Update state periodically when playing
  useEffect(() => {
    let interval: any;
    if (state.isPlaying) {
      interval = setInterval(() => {
        if (serviceRef.current) {
          const newState = serviceRef.current.getState();
          setState(newState);
        }
      }, 50); // 20fps for UI updates
    } else {
      if (serviceRef.current) {
        setState(serviceRef.current.getState());
      }
    }
    return () => clearInterval(interval);
  }, [state.isPlaying]);

  const loadTrack = useCallback((track: BackingTrack) => {
    try {
      serviceRef.current?.loadTrack(track);
      setCurrentTrack(track);
      setState(serviceRef.current!.getState());
    } catch (e) {
      console.error('[useBackingTrack] Failed to load track', e);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!serviceRef.current || !currentTrack) return;

    if (state.isPlaying) {
      serviceRef.current.stop();
    } else {
      await serviceRef.current.start();
    }
    setState(serviceRef.current.getState());
  }, [state.isPlaying, currentTrack]);

  const setTempo = useCallback((bpm: number) => {
    try {
      serviceRef.current?.setTempo(bpm);
      setState(prev => ({ ...prev, tempo: bpm }));
    } catch (e) {
      // Handled by service
    }
  }, []);

  const setTargetKey = useCallback((key: string) => {
    serviceRef.current?.setTargetKey(key);
  }, []);

  const setAudioPreset = useCallback((preset: 'clean' | 'crunch' | 'dreamy') => {
    serviceRef.current?.setAudioPreset(preset);
  }, []);

  const playNoodle = useCallback(() => {
    serviceRef.current?.playNoodle();
  }, []);

  return {
    ...state,
    currentTrack,
    loadTrack,
    togglePlay,
    setTempo,
    setTargetKey,
    setAudioPreset,
    playNoodle,
    availableTracks: BACKING_TRACKS
  };
};
