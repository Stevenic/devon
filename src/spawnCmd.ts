import { spawn } from 'child_process';
import { Stream } from 'stream';
import { WriteStream } from 'fs';
const string_argv = require('string-argv');

export async function spawnCmd<T>(line: string): Promise<T> {
    const [cmd, ...args] = string_argv(line);
    const promise = new Promise<T>((res, rej) => {
        const cp = spawn(cmd, args, { shell: true, stdio: ['inherit', 'pipe', 'inherit'] });
        const lines: string[] = [];
        cp.stdout.on('data', d => {
            process.stdout.write(d);
            lines.push(d.toString());
        });
        cp.stdout.on('error', ex => rej(ex));
        cp.stdout.on('close', () => {
            lines.join('\n');
            try {
                const obj = JSON.parse(lines.join('\n'));
                res(obj);
            } catch (ex) {
                rej(ex);
            }
        })
    });

    return promise;
}
