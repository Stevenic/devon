import { TextPrompt } from 'botbuilder-dialogs';
import * as path from 'path';
import * as fs from 'fs';

export class ExistingPathPrompt extends TextPrompt {
    constructor(dialogId: string) {
        super(dialogId, async (prompt) => {
            let value = prompt.recognized.value;
            if (value) {
                if (!path.isAbsolute(value)) {
                    value = path.resolve(value);
                }
                if (fs.existsSync(value)) {
                    prompt.recognized.value = value;
                    return true;
                }
            }
            return false;
        });
    }
}
