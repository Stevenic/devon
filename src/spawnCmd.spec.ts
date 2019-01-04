///<reference types='jasmine'/>
import { spawnCmd } from './spawnCmd';

describe('executeCmd', () => {
    it('parse output json', async () => {
        const names = await spawnCmd<string[]>('az account list --query [*].name');
        expect(names.length).toBeGreaterThan(1);
    });

    it('rejects on invalid command', async () => {
        let error = null;
        try {
            const names = await spawnCmd<string[]>('az account bogus --query [*].name');
            expect('should not got here').toEqual(null);
        } catch (ex) {
            error = ex;
        }
        expect(error).not.toBeNull();
    });
});
