
import { Chapter, TutorialStep, Challenge, ScaleType } from '../types';

export const loadLessons = async (): Promise<Chapter[]> => {
    try {
        const indexResponse = await fetch('./lessons/index.json');
        if (!indexResponse.ok) {
            throw new Error('Failed to fetch lessons/index.json');
        }
        const fileNames: string[] = await indexResponse.json();

        const chapterPromises = fileNames.map(async (fileName) => {
            const response = await fetch(`./lessons/${fileName}`);
            if (!response.ok) {
                console.error(`Failed to fetch ./lessons/${fileName}`);
                return null;
            }
            const text = await response.text();
            return parseMarkdownLessons(text)[0]; // Each file should contain one chapter
        });

        const chapters = await Promise.all(chapterPromises);
        return chapters.filter((ch): ch is Chapter => ch !== null);
    } catch (error) {
        console.error("Error loading lessons:", error);
        return [];
    }
};

const parseMarkdownLessons = (markdown: string): Chapter[] => {
    const chapters: Chapter[] = [];
    const lines = markdown.split('\n');

    let currentChapter: Partial<Chapter> | null = null;
    let currentStep: Partial<TutorialStep> | null = null;
    let currentChallenge: Partial<Challenge> | null = null;
    let processingSection: 'CHAPTER' | 'STEP' | 'CHALLENGE' | null = null;
    let lastProcessedKey: string | null = null;

    // Helper to finish processing the current item before starting a new one
    const commitCurrentItems = () => {
        if (currentStep && currentChapter) {
            if (!currentChapter.tutorialSteps) currentChapter.tutorialSteps = [];
            currentChapter.tutorialSteps.push(currentStep as TutorialStep);
            currentStep = null;
        }
        lastProcessedKey = null;
    };

    const commitChapter = () => {
        commitCurrentItems();
        if (currentChapter) {
            chapters.push(currentChapter as Chapter);
            currentChapter = null;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            // Support empty lines in multi-line content
            if (lastProcessedKey === 'instruction' && currentStep) {
                currentStep.instruction += '\n';
            } else if (lastProcessedKey === 'description' && currentChapter && processingSection === 'CHAPTER') {
                currentChapter.description += '\n';
            }
            continue;
        }

        if (line.startsWith('# ')) {
            // New Chapter
            commitChapter();
            currentChapter = {
                title: line.replace('# ', '').trim(),
                tutorialSteps: [] // Initialize array
            };
            processingSection = 'CHAPTER';
            continue;
        }

        if (line.startsWith('## Tutorial Step: ')) {
            commitCurrentItems();
            currentStep = {
                id: `step-${Date.now()}-${Math.random()}`, // Generate temp ID
                title: line.replace('## Tutorial Step: ', '').trim()
            };
            processingSection = 'STEP';
            continue;
        }

        if (line.startsWith('## Proficiency Challenge')) {
            commitCurrentItems();
            currentChallenge = {
                // We might need a generic ID or just use the data
            };
            if (currentChapter) {
                currentChapter.challenge = currentChallenge as Challenge;
            }
            processingSection = 'CHALLENGE';
            continue;
        }

        // Key-Value Parsing
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();

            lastProcessedKey = key;

            if (processingSection === 'CHAPTER' && currentChapter) {
                if (key === 'id') currentChapter.id = value;
                if (key === 'targetScaleType') currentChapter.targetScaleType = value as ScaleType;
                if (key === 'focus') currentChapter.focus = value;
                if (key === 'mission') currentChapter.mission = value;
                if (key === 'description') currentChapter.description = value;
            } else if (processingSection === 'STEP' && currentStep) {
                if (key === 'instruction') currentStep.instruction = value;
                if (key === 'targetInterval') currentStep.targetInterval = value;
                if (key === 'noodleId') currentStep.noodleId = value;
                if (key === 'actionText') currentStep.actionText = value;
            } else if (processingSection === 'CHALLENGE' && currentChallenge) {
                if (key === 'type') currentChallenge.type = value as any;
                if (key === 'targetInterval') currentChallenge.targetInterval = value;
                if (key === 'description') currentChallenge.description = value;
                if (key === 'requiredCount') currentChallenge.requiredCount = parseInt(value, 10);
            }
        } else {
            // Multi-line support: line has no colon, so it might be a continuation
            if (lastProcessedKey === 'instruction' && currentStep) {
                currentStep.instruction = (currentStep.instruction || '') + '\n' + line;
            } else if (lastProcessedKey === 'description' && currentChapter && processingSection === 'CHAPTER') {
                currentChapter.description = (currentChapter.description || '') + '\n' + line;
            } else if (lastProcessedKey === 'description' && currentChallenge && processingSection === 'CHALLENGE') {
                currentChallenge.description = (currentChallenge.description || '') + '\n' + line;
            }
        }
    }

    commitChapter(); // Commit the last valid chapter
    return chapters;
};
