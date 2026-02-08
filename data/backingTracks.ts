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
          // CALL: "Asking the question" (Rising tension)
          { note: 0, duration: 1 },    // Root
          { note: 3, duration: 0.5 },  // b3
          { note: 5, duration: 1.5 },  // 4 (Tension)
          
          // SPACE: Letting the listener digest
          { note: null, duration: 1.5 }, 
    
          // RESPONSE: "Answering" (Falling resolution)
          { note: 7, duration: 0.5 },  // 5
          { note: 5, duration: 0.5 },  // 4
          { note: 3, duration: 0.5 },  // b3
          { note: 0, duration: 2 },    // Root (Resolved)
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
          // CALL: The "Anthem" (Big sustained high note)
          { note: 7, duration: 0.5 }, 
          { note: 9, duration: 0.5 }, 
          { note: 12, duration: 2.5 }, // High Root held
          { note: null, duration: 1.0 },
    
          // RESPONSE: The "Shred" (Fast run down)
          { note: 9, duration: 0.25 }, 
          { note: 7, duration: 0.25 }, 
          { note: 4, duration: 0.25 }, 
          { note: 0, duration: 1.0 }, // Landing
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
          // CALL: Short, syncopated motif
          { note: 7, duration: 0.5 }, // 5
          { note: 10, duration: 0.5 }, // b7
          { note: null, duration: 0.5 },
          { note: 0, duration: 1.0 }, // Root
    
          // SPACE: Maximum groove (2 beats of silence)
          { note: null, duration: 2.0 },
    
          // RESPONSE: Echoing the motif lower
          { note: 3, duration: 0.5 }, // b3
          { note: 0, duration: 2.0 }, // Root
        ]
      }
    ];
    