
import { Chapter } from '../types';

/**
 * The CHAPTERS constant serves as the single source of truth for the 
 * curriculum. Each chapter contains its own tutorial sequence 
 * and a final proficiency challenge.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    title: 'The Box Shape',
    description: 'Master the classic "Box 1" pattern that defines rock, blues, and pop guitar.',
    targetScaleType: 'minor',
    focus: 'Pattern Recognition',
    mission: 'Identify the Root, 5th, and b3 intervals within the 1st position box.',
    tutorialSteps: [
      {
        id: 's1',
        title: 'The Home Base',
        instruction: 'The Root (R) is your anchor. It defines the key. Find the A note on the 5th fret of the Low E string.',
        targetInterval: 'R',
        actionText: 'Locate the Root (R) note'
      },
      {
        id: 's2',
        title: 'The Perfect 5th',
        instruction: 'The 5th (5) provides power. In this box, it is often found one string up and two frets over from the root.',
        targetInterval: '5',
        actionText: 'Find and click a 5th'
      },
      {
        id: 's3',
        title: 'The Bluesy Flat 3rd',
        instruction: 'The b3 is the "minor" note. It sits 3 frets up from your Root.',
        targetInterval: 'b3',
        actionText: 'Find the b3 interval'
      }
    ],
    challenge: {
      type: 'FIND_INTERVALS',
      targetInterval: 'R',
      description: 'Identify all three Root (R) notes within the Box 1 pattern area.',
      requiredCount: 3
    }
  },
  {
    id: 'ch2',
    title: 'The Major Twist',
    description: 'Learn how to shift the same physical shapes to play in bright, uplifting Major keys.',
    targetScaleType: 'major',
    focus: 'Modal Relationship',
    mission: 'Learn the "Happy" interval - the Major 3rd.',
    tutorialSteps: [
      {
        id: 's1',
        title: 'Major Foundation',
        instruction: 'The shape is the same, but the "feel" changes. Start by finding the Major Root.',
        targetInterval: 'R',
        actionText: 'Locate the Major Root'
      },
      {
        id: 's2',
        title: 'The Bright 3rd',
        instruction: 'The Major 3rd (3) is the defining note of this scale. It creates that sweet country/rock sound.',
        targetInterval: '3',
        actionText: 'Click the Major 3rd'
      },
      {
        id: 's3',
        title: 'The 6th Degree',
        instruction: 'The 6th interval adds a sophisticated, vocal-like quality to your licks.',
        targetInterval: '6',
        actionText: 'Find the 6th'
      }
    ],
    challenge: {
      type: 'FIND_INTERVALS',
      targetInterval: '3',
      description: 'Find all the Major 3rds (3). This is the "sweet note" for Major soloing.',
      requiredCount: 3
    }
  },
  {
    id: 'ch3',
    title: 'Blues & Tension',
    description: 'Master the "Blue Note" to add grit and sophisticated tension to your minor playing.',
    targetScaleType: 'minor',
    focus: 'Chromatic Nuance',
    mission: 'Locate the b5 tension note and understand its placement.',
    tutorialSteps: [
      {
        id: 's1',
        title: 'The Blue Note',
        instruction: 'The b5 is a passing note. It creates heavy tension. It sits exactly between the 4th and 5th.',
        targetInterval: 'b5',
        actionText: 'Find the b5 (Blue Note)'
      }
    ],
    challenge: {
      type: 'FIND_INTERVALS',
      targetInterval: 'b5',
      description: 'Find the Blue Note (b5) across three different octaves in the box.',
      requiredCount: 3
    }
  }
];
