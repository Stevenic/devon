import { spawn, SpawnOptions } from 'child_process';
import { Stream } from 'stream';
import { WriteStream } from 'fs';
const string_argv = require('string-argv');

export interface OutputSetting {
    // if true, the child-process stdout will be piped to the calling process output
    interactive?: boolean;
}
export async function spawnCmd<T>(line: string, options?: SpawnOptions & OutputSetting): Promise<T> {
    console.log(line);
    const [cmd, ...args] = string_argv(line);

    const quotedArgs = args.map(x => x.indexOf(' ') >= 0 || x.indexOf('>') >= 0 ? `"${x}"` : x);

    const promise = new Promise<T>((res, rej) => {
        const cp = spawn(cmd, quotedArgs, { ...options, shell: true, stdio: ['inherit', 'pipe', 'inherit'] });
        const lines: string[] = [];
        cp.stdout.on('data', d => {
            if (options && options.interactive) {
                process.stdout.write(d);
            }
            lines.push(d.toString());
        });
        cp.stdout.on('error', ex => rej(ex));
        cp.stdout.on('end', d => {
            if (d) {
                lines.push(d.toString());
            }
        });
        cp.on('close', code => {
            // reset color to normal
            process.stdout.write('\x1b[0m');
            if (code !== 0) {
                rej(code);
            } else {
                const text = lines.join('\n').trim();
                try {
                    const obj = text ? JSON.parse(text) : null;
                    res(obj);
                } catch (ex) {
                    res(undefined);
                }
            }
        })
    });

    return promise;
}
