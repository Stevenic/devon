///<reference types='jasmine'/>
import { spawnCmd } from './spawnCmd';

describe('executeCmd', async () => {
    it('parse output json', async () => {
        const names = await spawnCmd<string[]>('az account list --query [*].name');
        expect(names.length).toBeGreaterThan(1);
    });
    it('rejects on invalid command', async () => {
        try {
            await spawnCmd<string[]>('az account bogus --query [*].name');
            expect('should not got here').toBe(null);
        } catch (ex) {
            expect(ex).not.toBeNull();
        }
    });
});
