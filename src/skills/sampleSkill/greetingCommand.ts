import { WaterfallDialog, ChoicePrompt } from 'botbuilder-dialogs';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class GreetingCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'greeting');
        this.recognizer = recognizer || defaultRecognizer;
        this.intentName = 'Greeting';

        // Add options and processing step
        this.addProcessingStep(
            async (step) => await this.beginCommand(step, `prompt name -p "Hello. What's your name?"`),
            async (step) => await this.beginCommand(step, `echo Hi %name%, I'm Devon`),
            async (step) => await step.endDialog()
        );
    }
}


const defaultRecognizer = new RegExpRecognizer()
    .addIntent('Greeting', /(?:hello|hi)/i);
