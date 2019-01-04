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
            entityName: 'SampleName'
        });
        this.addProcessingStep(async (step) => {
            return await step.beginDialog('create', { name: step.options['name'] });
        });

        // Add create waterfall
        this.addDialog(new WaterfallDialog('create', [
            async (step) => {
                return await step.prompt('choices', {
                    prompt: `Pick a subscription`,
                    choices: ['sub1', 'sub2']
                });
            },
            async (step) => {
                await step.context.sendActivity(`You chose: ${step.result.value}`);
                return await step.endDialog();
            }
        ]));

        // Add support dialogs
        this.addDialog(new ChoicePrompt('choices'));
    }
}


const defaultRecognizer = new RegExpRecognizer()
    .addIntent('CreateBot', /(?:create|make) .*(?:sample) .*(?:named|called) (.*)/i, ['SampleName'])
    .addIntent('CreateBot', /(?:create|make) .*(?:sample)/i);
