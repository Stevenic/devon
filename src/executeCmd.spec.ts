///<reference types='jasmine'/>
import { executeCmd } from './executeCmd';

describe('executeCmd', async () => {
    it('parse output json', async () => {
        const names = await executeCmd<string[]>('az account list --query [*].name');
        expect(names.length).toBeGreaterThan(1);
    });
    it('rejects on invalid command', async () => {
        try {
            await executeCmd<string[]>('az account bogus --query [*].name');
            expect('should not got here').toBe(null);
        } catch (ex) {
            expect(ex).not.toBeNull();
        }
    });
});
