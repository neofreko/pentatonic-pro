
// Library of iconic phrases in Noodle DSL format

export const NOODLE_LIBRARY = {
  blues_king: [
    // BARS 1-2: Smooth Opening Statement
    "R/0.5", "5/0.5/v0.8", "7/0.5/v0.9/s", "10/0.5/v0.7", "12/2.0/v1.0", "R/4.0",
    // BARS 3-4: The Reach & Release
    "10/0.5/v0.8", "12/0.5/v1.0/b2", "10/0.5/v0.7/p", "7/0.5/v0.6", "5/2.0/v0.8/s", "R/4.0",
    // BARS 5-6: Over the IV (D7) - Pentatonic Phrasing
    "3/0.5/v0.8", "5/0.5/v0.7/h", "7/1.0/v0.9/s", "10/1.5/v1.0/b2", "7/0.5/v0.7", "R/4.0",
    // BARS 7-8: Back to I (A7) - High Resolution
    "12/0.5/v0.9/s", "15/0.5/v0.7", "17/2.0/v1.0/b2", "15/0.5/v0.8/p", "12/4.5/v0.9",
    // BARS 9-10: Turnaround Part 1 (E7 to D7)
    "12/0.25/v0.9", "15/0.25/v0.8", "12/0.25/v0.7", "10/0.25/v0.6", "7/1.0/v0.8/p", "5/1.0/v0.7/p", "0/2.0/v1.0", "R/3.0",
    // BARS 11-12: Final Resolution (A7 to E7)
    "3/0.5/v0.7", "5/0.5/v0.8/h", "0/3.0/v0.9/s", "R/4.0"
  ],
  rock_slash: [
    // BARS 1-4: The Climb
    "-5/1.0/v0.7", "-1/1.0/v0.8", "2/1.0/v0.8", "4/1.0/v0.9",
    "7/2.0/v1.0", "R/0.5", "9/0.5/v0.7", "11/1.0/v0.9",
    "12/4.0/v1.0/b1", "R/2.0",
    // BARS 5-8: Shred
    "16/0.5/v1.0", "14/0.5/v0.7/p", "12/0.5/v0.6", "11/0.5/v0.6",
    "9/0.5/v0.8", "7/0.5/v0.6", "4/0.5/v0.6", "2/0.5/v0.6",
    "0/1.0/v0.9", "-1/0.5/v0.5", "0/2.5/v0.8/s", "R/4.0"
  ],
  soul_maggot: [
    // BARS 1-4: Swell
    "0/2.0/v0.6/s", "3/1.0/v0.8", "5/1.0/v0.9/h",
    "7/4.0/v1.0/b0.5", "R/1.0",
    "10/0.5/v0.7", "12/2.5/v0.9/b1",
    // BARS 5-8: Comedown
    "R/2.0",
    "7/1.0/v0.7", "5/1.0/v0.6", "3/1.0/v0.5",
    "0/3.0/v0.6/s", "-5/2.0/v0.4", "R/4.0"
  ],
  rock_hard: [
    // BARS 1-2: Aggressive Call (Power fifths/root)
    "0/0.5/v1.0/s", "0/0.5/v0.8", "3/0.5/v0.9", "0/0.5/v0.7", "5/1.5/v1.0/b1", "R/0.5",
    // BARS 3-4: Fast Triplets / Picking
    "7/0.25/v0.9", "10/0.25/v0.8", "12/0.5/v1.0/s", "10/0.25/v0.7", "7/0.25/v0.6", "5/0.5/v0.8/p", "3/0.5/v0.7", "0/1.5/v0.9", "R/0.5",
    // BARS 5-6: High Altitude Bend
    "12/0.5/v0.8/s", "15/0.5/v0.9", "17/3.0/v1.0/b2", "R/1.0", // Whole step bend up
    // BARS 7-8: Descending Shred / Resolve
    "15/0.25/v0.9", "12/0.25/v0.8", "10/0.25/v0.7", "7/0.25/v0.6", "5/0.5/v0.8", "3/0.5/v0.7", "0/3.0/v1.0", "R/4.0"
  ],
  // Mini Solo 1: Smooth Blues in A Minor
  // Attribution: https://happybluesman.com/lessons/mini-solo-1-smooth-blues-in-a-minor/
  blues_solo_1: [
    // Pickup: starts on "and" of 4
    "R/3.5", "-2/0.5/v0.7/s",
    // BAR 1: Eighths, Triplets, and Quarter
    "0/0.5/v0.8", "3/0.5/v0.8", // Beat 1: D7, G5
    "5/0.33/v1.0/h", "6/0.33/v1.1/p", "5/0.34/v1.0", // Beat 2: G7-8-7 Triplet (Blue Note Eb)
    "3/0.5/v0.8", "5/0.5/v0.9/s", // Beat 3: G5, G7
    "7/1.0/v1.1", // Beat 4: G9 Quarter
    // BAR 2: Smooth descent
    "10/0.5/v1.0", "12/1.5/v1.1", // B8, B10 (vibrato)
    "7/0.5/v0.8/s", "5/0.5/v0.8/p", "0/1.0/v0.9", // G7-9-7 slide back, D7
    // BAR 3: Lower register work
    "-2/1.0/v0.8", // D5
    "5/0.5/v1.1/b0.5", "5/0.5/v0.8", // G7 bend/release
    "3/0.5/v0.9", "0/0.5/v0.8", // G5, D7
    "-2/0.5/v0.7", "-5/0.5/v0.7", // D5, A7
    // BAR 4: High register climax
    "3/0.5/v0.8", "5/0.5/v0.9", "7/0.5/v1.0/s", "10/0.5/v1.1", // G5, G7, G9(sl), B8
    "12/0.5/v1.1", "15/0.5/v1.2/s", "15/0.5/v1.1", "12/0.5/v1.0", // B10, B13-15(sl), B15, B13
    // BAR 5: Final Resolution to Blue Note
    "14/0.5/v1.1", // G14 (A)
    "12/0.25/v1.0/p", "10/0.25/v0.9", // G12, G10 (F)
    "10/0.5/v0.9", // D12 (G)
    "11/3.0/v1.3/v" // D13 (Eb - Blue Note Resolve)
  ],
  texas_flood: [
    // BAR 1: The Rake and Snap
    "R/0.5", "12/0.25/v1.2/s", "12/0.25/v1.0", "15/1.0/v1.3/b2", "12/0.5/v0.9/p", "15/0.5/v1.1", "12/1.0/v1.0",
    // BAR 2: Shifting Down
    "10/0.5/v0.9/s", "7/0.5/v0.8", "5/1.0/v1.1/b1", "3/0.5/v0.9/p", "0/1.5/v1.0",
    // BAR 3: Heavy Low-End Groove
    "-5/0.5/v1.1/s", "-2/0.5/v0.9", "0/0.5/v1.2/b0.5", "-2/0.5/v0.8", "-5/2.0/v1.0",
    // BAR 4: The Climb Back
    "0/0.5/v0.9", "3/0.5/v1.0/h", "5/0.5/v1.1/s", "7/0.5/v1.0", "10/0.5/v1.1/s", "12/1.5/v1.2/b2"
  ]
};
