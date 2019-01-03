import { TextPrompt } from 'botbuilder-dialogs';
import * as path from 'path';

export class PathPrompt extends TextPrompt {
    constructor(dialogId: string) {
        super(dialogId, async (prompt) => {
            let value = prompt.recognized.value;
            if (value) {
                if (!path.isAbsolute(value)) {
                    value = path.resolve(value);
                }
                prompt.recognized.value = value;
                return true;
            }
            return false;
        });
    }
}
