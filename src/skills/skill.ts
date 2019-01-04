import { TurnContext, RecognizerResult } from 'botbuilder';
import { DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { CustomSkillCommand, RecognizedCommand } from './customSkillCommand';
import { Recognizer } from './recognizer';
import { SkillSet } from './skillSet';

export class Skill extends CustomSkillCommand {
    protected readonly commands: CustomSkillCommand[] = [];

    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId);
        this.recognizer = recognizer;
    }

    public set parent(value: SkillSet) {
        super.parent = value;
        this.commands.forEach((cmd) => cmd.parent = value);
    }

    public addCommand(...commands: CustomSkillCommand[]): this {
        commands.forEach((cmd) => {
            // Assign parent
            cmd.parent = this.parent;

            // Assign the skills recognizer to the command if not already set
            if (!cmd.recognizer) {
                cmd.recognizer = this.recognizer;
            }

            // Add commands dialog and save reference
            this.addDialog(cmd);
            this.commands.push(cmd);
        });
        return this;
    }

    protected async onRecognizeCommand(context: TurnContext, utterance: string, recognized: RecognizerResult): Promise<RecognizedCommand|undefined> {
        let top: RecognizedCommand = undefined;
        for (let i = 0; i < this.commands.length; i++) {
            const recognized = await this.commands[i].recognizeCommand(context, utterance);
            if (recognized && (!top || recognized.score > top.score)) {
                // Return the skill as the command that was recognized (it will start the command when its started.)
                top = {
                    score: recognized.score,
                    dialogId: this.id,
                    dialogOptions: recognized
                };
            }
        }
        return top;
    }

    protected async onBeginDialog(dc: DialogContext, args: RecognizedCommand): Promise<DialogTurnResult> {
        // Start the recognized command
        return await dc.beginDialog(args.dialogId, args.dialogOptions);
    }
}
