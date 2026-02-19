
import { MelodyNote } from '../types';

/**
 * Noodle DSL Parser
 * 
 * Format: "NOTE/DURATION/VELOCITY/ARTICULATION"
 * - NOTE: Integer (relative semitone) or 'R' for Rest.
 * - DURATION: Float (beats).
 * - VELOCITY: 'v' + Float (0.0-1.0). Optional, default 0.8.
 * - ARTICULATION: 
 *    - 'b' + Amount (e.g., 'b1' = Bend 1 semitone)
 *    - 's' (Slide)
 *    - 'h' (Hammer-on)
 *    - 'p' (Pull-off)
 * 
 * Examples:
 * - "0/1.0" -> Root note, 1 beat
 * - "R/2.0" -> Rest, 2 beats
 * - "7/0.5/v0.9/b1" -> 5th note, 0.5 beat, loud, bend up 1 semitone
 * - "3/0.5/s" -> b3 note, 0.5 beat, slide into it
 */

export const parseNoodle = (dsl: string[]): MelodyNote[] => {
  return dsl.map(token => {
    const parts = token.split('/');
    const noteStr = parts[0];
    const duration = parseFloat(parts[1]);
    
    // Base object
    const melodyNote: MelodyNote = {
      note: noteStr === 'R' ? null : parseInt(noteStr, 10),
      duration: duration
    };

    // Parse optional parts (Velocity & Articulation)
    // We start from index 2
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('v')) {
        melodyNote.velocity = parseFloat(part.substring(1));
      } else if (part.startsWith('b')) {
        melodyNote.articulation = 'bend';
        melodyNote.bendAmount = parseFloat(part.substring(1));
      } else if (part === 's') {
        melodyNote.articulation = 'slide';
      } else if (part === 'h') {
        melodyNote.articulation = 'hammer';
      } else if (part === 'p') {
        melodyNote.articulation = 'pull';
      }
    }

    return melodyNote;
  });
};
