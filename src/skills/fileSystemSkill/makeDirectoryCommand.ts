import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class MakeDirectoryCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'md', 'mkdir');
        this.recognizer = recognizer || defaultRecognizer;
        this.intentName = 'MakeDirectory';

        // Add options and processing step
        this.addOption({ 
            name: 'path', 
            type: SkillCommandOptionType.string,
            defaultOption: true,
            required: true,
            entityName: 'Path',
            prompt: `Enter the path for the new directory:`
        });
        this.addProcessingStep(async (step) => {
            await this.call(`md ${step.options['path']}`);
            return await step.endDialog();
        });
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('MakeDirectory', /(?:create|make) .*(?:directory|folder|path) .*(?:named|called) (.*)/i, ['Path'])
    .addIntent('MakeDirectory', /(?:create|make) .*(?:directory|folder|path) (.*)/i, ['Path'])
    .addIntent('MakeDirectory', /(?:create|make) .*(?:directory|folder|path)/i);
