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
                              { note: 7, duration: 0.5, velocity: 0.9, articulation: 'slide' }, // Slide into the 5th
                              { note: 9, duration: 0.5, velocity: 0.7 }, 
                              { note: 0, duration: 2.0, velocity: 1.0, articulation: 'bend', bendAmount: 0.25 }, // Microtonal "Blues Curl" on Root
                              { note: null, duration: 1.0 },
                        
                              // BARS 3-4: The "Answer" - Falling blues scale
                              { note: 3, duration: 0.5, velocity: 0.9 }, 
                              { note: 0, duration: 0.5, velocity: 0.7, articulation: 'pull' }, // Pull-off
                              { note: -2, duration: 0.5, velocity: 0.6 }, 
                              { note: -5, duration: 2.5, velocity: 0.8 }, 
                              { note: null, duration: 4.0 },
                        
                              // BARS 5-6: The "Cry" - Bending the 4th to 5th
                              { note: 5, duration: 0.5, velocity: 0.8 }, 
                              { note: 6, duration: 0.5, velocity: 0.6 }, 
                              { note: 7, duration: 2.0, velocity: 1.0, articulation: 'bend', bendAmount: 1 }, // FULL STEP bend
                              { note: null, duration: 1.0 },
                        
                              // BARS 7-8: Final Resolution - The classic turnaround lick
                              { note: 3, duration: 0.5, velocity: 0.7 }, 
                              { note: 5, duration: 0.5, velocity: 0.8, articulation: 'hammer' }, 
                              { note: 0, duration: 3.0, velocity: 0.9, articulation: 'slide' }, 
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
                              { note: -5, duration: 1.0, velocity: 0.7 }, { note: -1, duration: 1.0, velocity: 0.8 }, { note: 2, duration: 1.0, velocity: 0.8 }, { note: 4, duration: 1.0, velocity: 0.9 }, 
                              { note: 7, duration: 2.0, velocity: 1.0 }, { note: null, duration: 0.5 }, { note: 9, duration: 0.5, velocity: 0.7 }, { note: 11, duration: 1.0, velocity: 0.9 },
                              { note: 12, duration: 4.0, velocity: 1.0, articulation: 'bend', bendAmount: 1 }, // High Root BEND to 2nd
                              { note: null, duration: 2.0 },
                        
                              // BARS 5-8: The Shred Run - Dynamics create the "machine gun" effect
                              { note: 16, duration: 0.5, velocity: 1.0 }, { note: 14, duration: 0.5, velocity: 0.7, articulation: 'pull' }, { note: 12, duration: 0.5, velocity: 0.6 }, { note: 11, duration: 0.5, velocity: 0.6 },
                              { note: 9, duration: 0.5, velocity: 0.8 }, { note: 7, duration: 0.5, velocity: 0.6 }, { note: 4, duration: 0.5, velocity: 0.6 }, { note: 2, duration: 0.5, velocity: 0.6 },
                              { note: 0, duration: 1.0, velocity: 0.9 }, { note: -1, duration: 0.5, velocity: 0.5 }, { note: 0, duration: 2.5, velocity: 0.8, articulation: 'slide' },
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
                              { note: 0, duration: 2.0, velocity: 0.6, articulation: 'slide' }, // Swell in
                              { note: 3, duration: 1.0, velocity: 0.8 }, 
                              { note: 5, duration: 1.0, velocity: 0.9, articulation: 'hammer' }, 
                              { note: 7, duration: 4.0, velocity: 1.0, articulation: 'bend', bendAmount: 0.5 }, // Quarter-tone cry
                              { note: null, duration: 1.0 },
                              { note: 10, duration: 0.5, velocity: 0.7 }, { note: 12, duration: 2.5, velocity: 0.9, articulation: 'bend', bendAmount: 1 }, 
                        
                              // BARS 5-8: The Comedown
                              { note: null, duration: 2.0 },
                              { note: 7, duration: 1.0, velocity: 0.7 }, { note: 5, duration: 1.0, velocity: 0.6 }, { note: 3, duration: 1.0, velocity: 0.5 }, 
                              { note: 0, duration: 3.0, velocity: 0.6, articulation: 'slide' }, // Fade out
                              { note: -5, duration: 2.0, velocity: 0.4 }, 
                              { note: null, duration: 4.0 },
                            ]
                          }
                        ];
                        