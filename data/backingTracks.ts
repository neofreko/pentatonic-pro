
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
    noodleSample: [0, 3, 5, 6, 7, 10, 12, 10, 7, 5, 3, 0] // Blues scale run
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
    noodleSample: [0, 2, 4, 7, 9, 12, 14, 12, 9, 7, 4, 0] // Major pentatonic run
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
    noodleSample: [0, 3, 5, 7, 10, 12, 15, 12, 10, 7, 5, 3, 0] // Minor pentatonic run
  }
];
