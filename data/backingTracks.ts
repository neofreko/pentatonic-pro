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
                  // BARS 1-2: Initial Call (The "A" Phrase)
                  { note: 0, duration: 1.0 }, { note: 3, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 3, duration: 0.5 }, { note: 0, duration: 1.5 },
                  { note: null, duration: 1.0 }, { note: 7, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 3, duration: 1.0 }, { note: null, duration: 1.0 },
            
                  // BARS 3-4: Response / Development (The "A'" Phrase)
                  { note: 0, duration: 0.5 }, { note: 3, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 6, duration: 0.5 }, { note: 7, duration: 2.0 },
                  { note: null, duration: 1.0 }, { note: 10, duration: 1.0 }, { note: 7, duration: 1.0 }, { note: null, duration: 1.0 },
            
                  // BARS 5-6: The Turnaround / Climax (The "B" Phrase)
                  { note: 12, duration: 1.5 }, { note: 10, duration: 0.5 }, { note: 7, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 3, duration: 1.0 },
                  { note: null, duration: 1.0 }, { note: 5, duration: 0.5 }, { note: 6, duration: 0.5 }, { note: 7, duration: 1.0 }, { note: null, duration: 1.0 },
            
                  // BARS 7-8: Final Resolution (The "C" Phrase)
                  { note: 5, duration: 0.5 }, { note: 3, duration: 0.5 }, { note: 0, duration: 3.0 },
                  { note: null, duration: 4.0 }, // Long fade out
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
                  // BARS 1-4: The Melodic Climb (Slow, lyrical)
                  { note: 0, duration: 2.0 }, { note: 4, duration: 1.0 }, { note: 7, duration: 1.0 },
                  { note: 9, duration: 3.0 }, { note: 7, duration: 1.0 },
                  { note: 12, duration: 2.0 }, { note: 14, duration: 1.0 }, { note: 16, duration: 1.0 },
                  { note: 19, duration: 4.0 }, // High sustain
            
                  // BARS 5-8: The Shred Response (Faster)
                  { note: null, duration: 2.0 },
                  { note: 16, duration: 0.5 }, { note: 14, duration: 0.5 }, { note: 12, duration: 0.5 }, { note: 9, duration: 0.5 },
                  { note: 7, duration: 0.5 }, { note: 4, duration: 0.5 }, { note: 2, duration: 0.5 }, { note: 0, duration: 0.5 },
                  { note: -3, duration: 0.5 }, { note: 0, duration: 0.5 }, { note: 2, duration: 0.5 }, { note: 4, duration: 0.5 },
                  { note: 7, duration: 0.5 }, { note: 12, duration: 3.5 }, // Grand finale
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
                  // BARS 1-4: Establishing the Motif
                  { note: 7, duration: 0.5 }, { note: 10, duration: 0.5 }, { note: 0, duration: 1.0 }, { note: null, duration: 2.0 },
                  { note: 7, duration: 0.5 }, { note: 10, duration: 0.5 }, { note: 0, duration: 1.0 }, { note: 3, duration: 0.5 }, { note: 0, duration: 1.5 },
                  { note: null, duration: 4.0 }, // Space for the groove
            
                  // BARS 5-8: Variation and Release
                  { note: 12, duration: 1.5 }, { note: 10, duration: 0.5 }, { note: 7, duration: 0.5 }, { note: 5, duration: 0.5 }, { note: 3, duration: 1.0 },
                  { note: null, duration: 1.0 }, { note: 0, duration: 3.0 },
                  { note: null, duration: 4.0 },
                ]
              }
            ];
            