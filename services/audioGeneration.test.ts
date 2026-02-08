
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackingTrackService } from './backingTrackService';

describe('BackingTrackService Audio Generation', () => {
  let service: BackingTrackService;
  
  beforeEach(() => {
    // Basic mock just to instantiate the class
    const mockAudioContext = {
      sampleRate: 44100,
      createBuffer: vi.fn().mockReturnValue({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(44100 * 2)) // 2 seconds
      })
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
});
