
import { describe, it, expect } from 'vitest';
import { parseNoodle } from './noodleParser';
import { NOODLE_LIBRARY } from '../data/noodleLibrary';

describe('Noodle Library - Blues Solo 1', () => {
    it('should contain the newly imported blues solo', () => {
        // @ts-ignore
        expect(NOODLE_LIBRARY.blues_solo_1).toBeDefined();
    });

    it('should be parseable by parseNoodle', () => {
        // @ts-ignore
        const solo = NOODLE_LIBRARY.blues_solo_1;
        if (solo) {
            const parsed = parseNoodle(solo);
            expect(parsed.length).toBeGreaterThan(0);
            expect(parsed[0]).toHaveProperty('duration');
        }
    });
});
