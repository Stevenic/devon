import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class ListDirectoryCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'dir', 'ls');
        this.recognizer = recognizer || defaultRecognizer;
        this.intentName = 'ListDirectory';

        // Add options and processing step
        this.addOption({ 
            name: 'path', 
            type: SkillCommandOptionType.string,
            defaultOption: true,
            entityName: 'Path'
        });
        this.addProcessingStep(
            async (step) => await this.beginCommand(step, `call dir ${step.options['path'] ? step.options['path'] : ''}`),
            async (step) => await step.endDialog()
        );
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('ListDirectory', /(?:list|show) .*(?:directory|folder|path) .*(?:named|called) (.*)/i, ['Path'])
    .addIntent('ListDirectory', /(?:list|show) .*(?:directory|folder|path) (.*)/i, ['Path'])
    .addIntent('ListDirectory', /(?:list|show) .*(?:directory|folder|path)/i);
