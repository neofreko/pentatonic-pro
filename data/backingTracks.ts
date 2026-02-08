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
      { note: 0, duration: 1 },    // Root (A) - Quarter
      { note: 3, duration: 0.5 },  // Minor 3rd (C) - Eighth
      { note: 5, duration: 1.5 },  // 4th (D) - Dotted Quarter
      { note: null, duration: 0.5 }, // Rest
      { note: 7, duration: 0.5 },  // 5th (E)
      { note: 5, duration: 0.5 },  // 4th (D)
      { note: 3, duration: 0.5 },  // Minor 3rd (C)
      { note: 0, duration: 2 },    // Root (A) - Half note (Resolution)
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
      { note: 0, duration: 0.5 }, { note: 4, duration: 0.5 }, { note: 7, duration: 1 }, // Major Triad Up
      { note: 9, duration: 0.5 }, { note: 7, duration: 0.5 }, { note: 4, duration: 0.5 }, { note: 0, duration: 0.5 }, // Run Down
      { note: 12, duration: 2 }, // High Root - Sustained
      { note: null, duration: 1 }, // Space
      { note: 9, duration: 0.5 }, { note: 12, duration: 0.5 }, // Pick up
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
      { note: 7, duration: 0.5 }, // 5th (E)
      { note: 10, duration: 1.5 }, // 7th (G) - Syncopated
      { note: 0, duration: 0.5 }, // Root (A)
      { note: null, duration: 0.5 }, // Breath
      { note: 3, duration: 0.5 }, // m3 (C)
      { note: 5, duration: 0.5 }, // 4th (D)
      { note: 3, duration: 0.5 }, // m3 (C)
      { note: 0, duration: 2.5 }, // Root (A) - Long sustain
    ]
  }
];