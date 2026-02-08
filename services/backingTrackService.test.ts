
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackingTrackService } from './backingTrackService';
import { BackingTrack } from '../types';

describe('BackingTrackService', () => {
  let service: BackingTrackService;
  
  const mockTrack: BackingTrack = {
    id: 'test-track',
    name: 'Test Blues',
    description: 'A test blues progression',
    key: 'A',
    mode: 'blues',
    tempo: 120,
    timeSignature: [4, 4],
    style: 'blues',
    progression: [
      { root: 'A', quality: '7', duration: 4 },
      { root: 'D', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'E', quality: '7', duration: 4 },
    ],
    noodleSample: [
      { note: 0, duration: 1 },
      { note: 3, duration: 1 },
      { note: null, duration: 1 },
      { note: 5, duration: 1 }
    ]
  };

  beforeEach(() => {
    // Mock AudioContext
    const mockAudioContext = {
      currentTime: 0,
      state: 'suspended',
      sampleRate: 44100,
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { 
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        },
        type: 'sine'
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { 
          setValueAtTime: vi.fn(), 
          exponentialRampToValueAtTime: vi.fn(), 
          linearRampToValueAtTime: vi.fn() 
        }
      }),
      createBiquadFilter: vi.fn().mockReturnValue({
        connect: vi.fn(),
        type: 'lowpass',
        frequency: { value: 0 }
      }),
      createBuffer: vi.fn().mockReturnValue({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(100))
      }),
      createBufferSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null
      }),
      destination: {}
    };

    // @ts-ignore
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    
    service = new BackingTrackService();
  });

  it('should initialize with default state', () => {
    const state = service.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentBeat).toBe(0);
  });

  it('should validate tempo ranges', () => {
    expect(() => service.setTempo(20)).toThrow('Tempo must be between 40 and 240 BPM');
    expect(() => service.setTempo(300)).toThrow('Tempo must be between 40 and 240 BPM');
    
    service.setTempo(120);
    expect(service.getState().tempo).toBe(120);
  });

  it('should load a track and calculate total beats', () => {
    service.loadTrack(mockTrack);
    const state = service.getState();
    expect(state.totalBeats).toBe(16); // 4 chords * 4 beats each
    expect(state.tempo).toBe(120);
  });

  it('should throw error when loading invalid track', () => {
    const invalidTrack = { ...mockTrack, progression: [] };
    expect(() => service.loadTrack(invalidTrack)).toThrow('Progression must contain at least one chord');
  });

  it('should start and stop playback', async () => {
    service.loadTrack(mockTrack);
    await service.start();
    expect(service.getState().isPlaying).toBe(true);
    
    service.stop();
    expect(service.getState().isPlaying).toBe(false);
    expect(service.getState().currentBeat).toBe(0);
  });
});
