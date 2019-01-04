import { WaterfallDialog, ChoicePrompt } from 'botbuilder-dialogs';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class CreateCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'sample create');
        this.recognizer = recognizer || defaultRecognizer;
        this.intentName = 'CreateBot';

        // Add options and processing step
        this.addOption({ 
            name: 'name', 
            type: SkillCommandOptionType.string,
            defaultOption: true,
            required: true,
            entityName: 'SampleName',
            prompt: `What would you like to call your sample?`
        });
        this.addProcessingStep(async (step) => {
            return await step.beginDialog('create', { name: step.options['name'] });
        });

        // Add create waterfall
        this.addDialog(new WaterfallDialog('create', [
            async (step) => await this.beginCommand(step, `set name=${step.options['name']}`),
            async (step) => await this.beginCommand(step, `echo Creating "%name%" Sample`),
            async (step) => await this.beginCommand(step, 'md "%name%"'),
            async (step) => await step.endDialog()
        ]));

        // Add support dialogs
        this.addDialog(new ChoicePrompt('choices'));
    }
}


const defaultRecognizer = new RegExpRecognizer()
    .addIntent('CreateBot', /(?:create|make) .*(?:sample) .*(?:named|called) (.*)/i, ['SampleName'])
    .addIntent('CreateBot', /(?:create|make) .*(?:sample)/i);
