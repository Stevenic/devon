import { Skill } from '../skill';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class FileSystemSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer || defaultRecognizer);
    
        // Add skill commands
        const makeDirectory = new SkillCommand('makeDirectory', 'md', 'mkdir');
        makeDirectory.intentName = 'MakeDirectory';
        makeDirectory.addOption({ 
            name: 'path', 
            type: SkillCommandOptionType.path,
            defaultOption: true,
            required: true
        });
        makeDirectory.addProcessingStep(async (step) => {
            await step.context.sendActivity(`creating: ${step.options['path']}`);
            return await step.endDialog();
        });
        this.addCommand(makeDirectory);
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('MakeDirectory', /(?:create|make) .*(?:directory|folder|path)/i)
    .addIntent('MakeDirectory', /(?:create|make) .*(?:directory|folder|path) .*(?:named|called) (.*)/i, ['path']);
