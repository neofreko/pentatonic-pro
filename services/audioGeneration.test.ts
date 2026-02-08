
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackingTrackService } from './backingTrackService';

describe('BackingTrackService Audio Generation', () => {
  let service: BackingTrackService;
  
  beforeEach(() => {
    // Basic mock just to instantiate the class
    const mockAudioContext = {
      sampleRate: 44100,
      createBuffer: vi.fn().mockImplementation(() => ({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(44100 * 2)) // 2 seconds
      })),
      createBufferSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        buffer: null,
        playbackRate: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
      }),
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() }
      }),
      createWaveShaper: vi.fn().mockReturnValue({
        connect: vi.fn(),
        curve: null,
        oversample: 'none'
      }),
      createBiquadFilter: vi.fn().mockReturnValue({
        connect: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn(), value: 0 },
        gain: { setValueAtTime: vi.fn(), value: 0 },
        type: 'lowpass'
      }),
      createDelay: vi.fn().mockReturnValue({
        connect: vi.fn(),
        delayTime: { value: 0 }
      }),
      destination: {}
    };
    
    // @ts-ignore
    global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext);
    service = new BackingTrackService();
    // @ts-ignore
    service.initAudio();
  });

  it('should generate valid audio buffer without NaNs', () => {
    // @ts-ignore - Accessing private method for testing
    const buffer = service.generateStringBuffer(440, 2.0);
    const data = buffer.getChannelData(0);
    
    // Check first few samples (Noise burst)
    expect(data[0]).not.toBeNaN();
    expect(data[0]).not.toBe(0); // Should be noise

    // Check decay section (Karplus-Strong loop)
    const period = Math.round(44100 / 440);
    expect(data[period + 1]).not.toBeNaN();
    
    // Ensure signal doesn't die instantly (valid decay)
    expect(Math.abs(data[period + 50])).toBeGreaterThan(0);
    
    // Check for NaNs anywhere
    const hasNaN = data.some((val: number) => Number.isNaN(val));
    expect(hasNaN).toBe(false);
  });

  it('should apply different decay rates based on preset', () => {
    // 1. Generate Clean Buffer
    service.setAudioPreset('clean');
    // @ts-ignore
    const cleanBuffer = service.generateStringBuffer(440, 2.0);
    const cleanData = cleanBuffer.getChannelData(0);

    // 2. Generate Crunch Buffer
    service.setAudioPreset('crunch');
    // @ts-ignore
    const crunchBuffer = service.generateStringBuffer(440, 2.0);
    const crunchData = crunchBuffer.getChannelData(0);

    // 3. Compare decay
    // Calculate period
    const period = Math.round(44100 / 440);
    const checkIndex = period * 10; // Check after 10 cycles

    // In the implementation:
    // Clean decay = 0.996
    // Crunch decay = 0.992
    // Since we are iterating: val * decay, the crunch signal should decay faster (be smaller)
    // However, the initial noise burst is random, so we can't compare absolute values directly unless we mock Math.random.
    
    // Strategy: Mock Math.random to return constant 0.8 to ensure deterministic, non-zero output
    // 0.8 * 2 - 1 = 0.6
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.8);

    // Regenerate with deterministic noise
    service.setAudioPreset('clean');
    // @ts-ignore
    const detCleanBuffer = service.generateStringBuffer(440, 2.0);
    const detCleanData = detCleanBuffer.getChannelData(0);

    service.setAudioPreset('crunch');
    // @ts-ignore
    const detCrunchBuffer = service.generateStringBuffer(440, 2.0);
    const detCrunchData = detCrunchBuffer.getChannelData(0);

    // Crunch (0.992) should decay faster than Clean (0.996), so at the same index, Crunch value should be smaller
    expect(Math.abs(detCrunchData[checkIndex])).toBeLessThan(Math.abs(detCleanData[checkIndex]));

    randomSpy.mockRestore();
  });

  it('should create amp signal chain nodes (distortion, EQ, cabinet)', () => {
    const createBiquadFilter = vi.fn().mockReturnValue({
      connect: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn(), value: 0 },
      gain: { setValueAtTime: vi.fn(), value: 0 },
      type: 'lowpass'
    });
    
    const createWaveShaper = vi.fn().mockReturnValue({
      connect: vi.fn(),
      curve: null,
      oversample: 'none'
    });

    // Update mock for this test
    // @ts-ignore
    service.audioCtx.createBiquadFilter = createBiquadFilter;
    // @ts-ignore
    service.audioCtx.createWaveShaper = createWaveShaper;

    // Trigger a note
    // @ts-ignore
    service.playGuitarNote(60, 0, 1.0, 0.8);

    // Expect WaveShaper (Distortion)
    expect(createWaveShaper).toHaveBeenCalled();

    // Expect multiple filters (Tonestack + Cabinet)
    // We expect at least 4 filters: MidBoost, CabHP, CabLP1, CabLP2
    expect(createBiquadFilter).toHaveBeenCalledTimes(4);
  });
});
