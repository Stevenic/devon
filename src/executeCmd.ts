import { execSync } from 'child_process';

export async function executeCmd<T>(line: string): Promise<T> {
    try {
        const result = execSync(line);
        const obj = JSON.parse(result.toString());
        return Promise.resolve<T>(obj);
    } catch (ex) {
        return Promise.reject(ex);
    }
}
