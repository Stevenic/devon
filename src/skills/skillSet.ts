
import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, DialogState, DialogSet, DialogTurnResult, DialogTurnStatus, DialogContext } from 'botbuilder-dialogs';
import { Skill } from './skill';
import { RecognizedCommand } from './customSkillCommand';
import { Recognizer } from './recognizer';
import { TurnContext } from 'botbuilder';

const DEFAULT_DIALOG_ID = 'all_skills';

export interface SkillSetOptions {
    command?: string;
    silent?: boolean;
}

export class SkillSet extends ComponentDialog {
    private readonly mainDialogSet: DialogSet;
    protected readonly skills: Skill[] = [];
    public recognizer: Recognizer;

    constructor(conversationState: StatePropertyAccessor<DialogState>, dialogId = DEFAULT_DIALOG_ID) {
        super(dialogId);
        this.mainDialogSet = new DialogSet(conversationState);
        this.mainDialogSet.add(this);
    }

    public addSkill(...skills: Skill[]): this {
        skills.forEach((skill) => {
            // Assign parent
            skill.parent = this;
            
            // Assign the root recognizer to the skill if not already set
            if (!skill.recognizer) {
                skill.recognizer = this.recognizer;
            }

            // Add skills dialog and save reference
            this.addDialog(skill);
            this.skills.push(skill);
        });
        return this;
    }

    public async beginCommand(dc: DialogContext, command: string, silent = true): Promise<DialogTurnResult> {
        return await dc.beginDialog(this.id, { command: command, silent: silent });
    }

    public async run(context: TurnContext, options?: SkillSetOptions): Promise<DialogTurnResult> {
        // Create a dialog context and try to continue running the current dialog
        const dc = await this.mainDialogSet.createContext(context);
        let result = await dc.continueDialog();

        // Start the main dialog if there wasn't a running one
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.id, options);
        }
        return result;
    }

    protected async onBeginDialog(dc: DialogContext, options?: SkillSetOptions): Promise<DialogTurnResult> {
        // Find skill to run
        const utterance =  options && options.command ? options.command : dc.context.activity.text;
        const recognized = await this.onRecognizeCommand(dc.context, utterance);
        if (recognized) {
            return await dc.beginDialog(recognized.dialogId, recognized.dialogOptions);
        } else {
            if (!options.silent) {
                await dc.context.sendActivity(`I couldn't find a command to run.`);
            }
            return { status: DialogTurnStatus.complete, result: 'not found' };
        }
    }

    protected async onRecognizeCommand(context: TurnContext, utterance: string): Promise<RecognizedCommand|undefined> {
        let top: RecognizedCommand = undefined;
        for (let i = 0; i < this.skills.length; i++) {
            const recognized = await this.skills[i].recognizeCommand(context, utterance);
            if (recognized && (!top || recognized.score > top.score)) {
                top = recognized;
            }
        }
        return top;
    }
}