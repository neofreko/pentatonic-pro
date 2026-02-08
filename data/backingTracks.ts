import { BackingTrack } from '../types';
import { parseNoodle } from '../utils/noodleParser';
import { NOODLE_LIBRARY } from './noodleLibrary';

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
    noodleSample: parseNoodle(NOODLE_LIBRARY.blues_king)
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
    noodleSample: parseNoodle(NOODLE_LIBRARY.rock_slash)
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
    noodleSample: parseNoodle(NOODLE_LIBRARY.soul_maggot)
  }
];