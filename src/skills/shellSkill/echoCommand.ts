import { TurnContext, RecognizerResult } from 'botbuilder';
import { CustomSkillCommand, RecognizedCommand } from '../customSkillCommand';
import { DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';

export interface EchoCommandOptions {
    message: string;
}

export class EchoCommand extends CustomSkillCommand {

    protected async onRecognizeCommand(context: TurnContext, utterance: string, recognized: RecognizerResult): Promise<RecognizedCommand|undefined> {
        if (utterance.toLowerCase().startsWith('echo ') && utterance.length) {
            const message = utterance.substr(4);
            return {
                score: 1.0,
                dialogId: this.id,
                dialogOptions: { 
                    message: message
                } as EchoCommandOptions
            };
        }
        return undefined;
    }

    protected async onBeginDialog(dc: DialogContext, options: EchoCommandOptions): Promise<DialogTurnResult> {
        await dc.context.sendActivity(options.message);
        return { status: DialogTurnStatus.complete };
    }
}
