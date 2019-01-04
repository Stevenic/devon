import { TurnContext, RecognizerResult } from 'botbuilder';
import { CustomSkillCommand, RecognizedCommand } from '../customSkillCommand';
import { DialogContext, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';

export interface SetCommandOptions {
    variable: string;
    value: string;    
}

export class SetCommand extends CustomSkillCommand {

    protected async onRecognizeCommand(context: TurnContext, utterance: string, recognized: RecognizerResult): Promise<RecognizedCommand|undefined> {
        if (utterance.toLowerCase().startsWith('set ')) {
            const parts = utterance.substr(4).split('=');
            const variable = parts[0].trim();
            const value = parts.length > 1 ? parts.splice(1).join(' ').trim() : undefined;
            if (variable.length > 0) {
                return {
                    score: 1.0,
                    dialogId: this.id,
                    dialogOptions: { 
                        variable: variable,
                        value: value
                    } as SetCommandOptions
                };
            }
        }
        return undefined;
    }

    protected async onBeginDialog(dc: DialogContext, options: SetCommandOptions): Promise<DialogTurnResult> {
        if (options.value !== undefined) {
            process.env[options.variable] = options.value;
        } else {
            const value = process.env[options.variable];
            await dc.context.sendActivity(`${options.variable}=${value !== undefined ? value.toString() : ''}`);
        }
        return { status: DialogTurnStatus.complete };
    }
}
