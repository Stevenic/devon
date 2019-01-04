import { TurnContext, RecognizerResult } from 'botbuilder';
import { CustomSkillCommand, RecognizedCommand } from '../customSkillCommand';
import { DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';
import { spawnCmd } from '../../spawnCmd';

export interface CallCommandOptions {
    command: string;
}

export class CallCommand extends CustomSkillCommand {

    protected async onRecognizeCommand(context: TurnContext, utterance: string, recognized: RecognizerResult): Promise<RecognizedCommand|undefined> {
        if (utterance.toLowerCase().startsWith('call ') && utterance.length) {
            const command = utterance.substr(5);
            return {
                score: 1.0,
                dialogId: this.id,
                dialogOptions: { 
                    command: command
                } as CallCommandOptions
            };
        }
        return undefined;
    }

    protected async onBeginDialog(dc: DialogContext, options: CallCommandOptions): Promise<DialogTurnResult> {
        const result = await spawnCmd(options.command);
        return { status: DialogTurnStatus.complete, result: result };
    }
}
