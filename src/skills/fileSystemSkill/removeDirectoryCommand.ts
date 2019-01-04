import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class RemoveDirectoryCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'rd', 'rmdir');
        this.recognizer = recognizer || defaultRecognizer;
        this.intentName = 'RemoveDirectory';

        // Add options and processing step
        this.addOption({ 
            name: 'path', 
            type: SkillCommandOptionType.string,
            defaultOption: true,
            required: true,
            entityName: 'Path',
            prompt: `Enter the path for the directory to remove:`
        });
        this.addProcessingStep(async (step) => {
            await this.call(`rd ${step.options['path']}`);
            return await step.endDialog();
        });
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('RemoveDirectory', /(?:remove|delete) .*(?:directory|folder|path) .*(?:named|called) (.*)/i, ['Path'])
    .addIntent('RemoveDirectory', /(?:remove|delete) .*(?:directory|folder|path) (.*)/i, ['Path'])
    .addIntent('RemoveDirectory', /(?:remove|delete) .*(?:directory|folder|path)/i);
