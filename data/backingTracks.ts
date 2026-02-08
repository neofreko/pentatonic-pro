import { BackingTrack } from '../types';

export const BACKING_TRACKS: BackingTrack[] = [
  {
    id: 'blues-in-a',
    name: 'Slow Blues',
    description: 'A classic 12-bar blues progression.',
    key: 'A',
    mode: 'blues',
    tempo: 75,
    timeSignature: [4, 4],
    style: 'blues',
    progression: [
      { root: 'A', quality: '7', duration: 4 },
      { root: 'D', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'D', quality: '7', duration: 4 },
      { root: 'D', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'E', quality: '7', duration: 4 },
      { root: 'D', quality: '7', duration: 4 },
      { root: 'A', quality: '7', duration: 4 },
      { root: 'E', quality: '7', duration: 4 },
    ],
                    noodleSample: [
                      // Inspired by "The Thrill Is Gone" (B.B. King style)
                      // BARS 1-2: The "King's Call" - Sparse, stinging vibrato
                      { note: 7, duration: 0.5 }, { note: 9, duration: 0.5 }, { note: 0, duration: 2.0 }, // 5 -> 6 -> High Root
                      { note: null, duration: 1.0 },
                
                      // BARS 3-4: The "Answer" - Falling blues scale
                      { note: 3, duration: 0.5 }, { note: 0, duration: 0.5 }, { note: -2, duration: 0.5 }, { note: -5, duration: 2.5 }, // b3 -> R -> b7 -> 5
                      { note: null, duration: 4.0 },
                
                      // BARS 5-6: The "Cry" - Bending the 4th to 5th
                      { note: 5, duration: 0.5 }, { note: 6, duration: 0.5 }, { note: 7, duration: 2.0 }, // 4 -> b5 -> 5 (Blue note slide)
                      { note: null, duration: 1.0 },
                
                      // BARS 7-8: Final Resolution - The classic turnaround lick
                      { note: 3, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 0, duration: 3.0 }, // b3 -> 4 -> Root
                      { note: null, duration: 4.0 },
                    ]
                  },
                  {
                    id: 'rock-groove-major',
                    name: 'Stadium Rock',
                    description: 'Anthemic major key rock progression.',
                    key: 'C',
                    mode: 'major',
                    tempo: 120,
                    timeSignature: [4, 4],
                    style: 'rock',
                    progression: [
                      { root: 'C', quality: 'major', duration: 4 },
                      { root: 'G', quality: 'major', duration: 4 },
                      { root: 'A', quality: 'minor', duration: 4 },
                      { root: 'F', quality: 'major', duration: 4 },
                    ],
                    noodleSample: [
                      // Inspired by "Sweet Child O' Mine" (Slash style)
                      // BARS 1-4: The Lyrical Climb
                      { note: -5, duration: 1.0 }, { note: -1, duration: 1.0 }, { note: 2, duration: 1.0 }, { note: 4, duration: 1.0 }, // 5 -> 7 -> 2 -> 3
                      { note: 7, duration: 2.0 }, { note: null, duration: 0.5 }, { note: 9, duration: 0.5 }, { note: 11, duration: 1.0 },
                      { note: 12, duration: 4.0 }, // High Root sustain (The "Anthem" note)
                      { note: null, duration: 2.0 },
                
                      // BARS 5-8: The Shred Run
                      { note: 16, duration: 0.5 }, { note: 14, duration: 0.5 }, { note: 12, duration: 0.5 }, { note: 11, duration: 0.5 },
                      { note: 9, duration: 0.5 }, { note: 7, duration: 0.5 }, { note: 4, duration: 0.5 }, { note: 2, duration: 0.5 },
                      { note: 0, duration: 1.0 }, { note: -1, duration: 0.5 }, { note: 0, duration: 2.5 },
                      { note: null, duration: 4.0 },
                    ]
                  },
                  {
                    id: 'minor-soul-groove',
                    name: 'Minor Soul',
                    description: 'Smooth and moody minor key groove.',
                    key: 'A',
                    mode: 'minor',
                    tempo: 90,
                    timeSignature: [4, 4],
                    style: 'funk',
                    progression: [
                      { root: 'A', quality: 'minor', duration: 8 },
                      { root: 'D', quality: 'minor', duration: 4 },
                      { root: 'E', quality: '7', duration: 4 },
                    ],
                    noodleSample: [
                      // Inspired by "Maggot Brain" (Funkadelic style)
                      // BARS 1-4: The Emotional Swell
                      { note: 0, duration: 2.0 }, { note: 3, duration: 1.0 }, { note: 5, duration: 1.0 }, // Root -> b3 -> 4
                      { note: 7, duration: 4.0 }, // Sustained 5th (Crying tone)
                      { note: null, duration: 1.0 },
                      { note: 10, duration: 0.5 }, { note: 12, duration: 2.5 }, // High b7 -> Root
                
                      // BARS 5-8: The Comedown
                      { note: null, duration: 2.0 },
                      { note: 7, duration: 1.0 }, { note: 5, duration: 1.0 }, { note: 3, duration: 1.0 }, // Falling
                      { note: 0, duration: 3.0 }, // Root
                      { note: -5, duration: 2.0 }, // Low 5th (Deep resolve)
                      { note: null, duration: 4.0 },
                    ]
                  }
                ];
                