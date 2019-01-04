import { spawnSync } from 'child_process';
import { Stream } from 'stream';
import { WriteStream } from 'fs';
const string_argv = require('string-argv');

export async function spawnCmd<T>(line: string): Promise<T> {
    const [cmd, ...args] = string_argv(line);
    try {
        const result = spawnSync(cmd, args, { shell: true, stdio: ['inherit', 'pipe', 'inherit'] });
        return Promise.resolve<T>(JSON.parse(result.output.join('\n')));
    } catch (ex) {
        return Promise.reject(ex);
    }
}
