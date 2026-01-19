
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const TUNING = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E in terms of index in NOTES

// MIDI note numbers for open strings: High E4 (64), B3 (59), G3 (55), D3 (50), A2 (45), Low E2 (40)
export const MIDI_TUNING = [64, 59, 55, 50, 45, 40];

export const SCALE_INTERVALS = {
  minor: [0, 3, 5, 6, 7, 10], // 1, b3, 4, b5 (blue), 5, b7
  major: [0, 2, 4, 7, 9],     // 1, 2, 3, 5, 6
};

export const FRET_COUNT = 15;
