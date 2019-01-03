
import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, DialogState, DialogSet, DialogTurnResult, DialogTurnStatus, DialogContext } from 'botbuilder-dialogs';
import { Skill } from './skill';
import { RecognizedCommand } from './customSkillCommand';
import { Recognizer } from './recognizer';
import { TurnContext } from 'botbuilder';

const DEFAULT_MAIN_DIALOG = 'main';

export class RootSkillSet extends ComponentDialog {
    private readonly mainDialogSet: DialogSet;
    protected readonly skills: Skill[] = [];
    public recognizer: Recognizer;

    constructor(conversationState: StatePropertyAccessor<DialogState>, dialogId = DEFAULT_MAIN_DIALOG) {
        super(dialogId);
        this.mainDialogSet = new DialogSet(conversationState);
        this.mainDialogSet.add(this);
    }

    public addSkill(...skills: Skill[]): this {
        skills.forEach((skill) => {
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

    public async run(context: TurnContext, options?: any): Promise<DialogTurnResult> {
        // Create a dialog context and try to continue running the current dialog
        const dc = await this.mainDialogSet.createContext(context);
        let result = await dc.continueDialog();

        // Start the main dialog if there wasn't a running one
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.id, options);
        }
        return result;
    }

    protected onBeginDialog(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        return this.onRunTurn(dc, options);
    }

    protected onContinueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return this.onRunTurn(dc);
    }

    protected async onRunTurn(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        // Check for creation of a new tangent
        const isActive = dc.stack.length > 0;
        const newTangent = dc.context.activity.text.startsWith('?');
        if (!isActive || newTangent) {
            // Find skill to run
            const recognized = await this.onRecognize(dc.context);
            if (recognized) {
                return await dc.beginDialog(recognized.dialogId, recognized.dialogOptions);
            } else {
                await dc.context.sendActivity(`I'm sorry I didn't understand.`);
                if (isActive) {
                    await dc.repromptDialog();
                    return { status: DialogTurnStatus.waiting };
                } else {
                    return { status: DialogTurnStatus.complete };
                }
            }
        } else {
            return await dc.continueDialog();
        }
    }

    protected async onRecognize(context: TurnContext): Promise<RecognizedCommand|undefined> {
        let top: RecognizedCommand = undefined;
        for (let i = 0; i < this.skills.length; i++) {
            const recognized = await this.skills[i].recognizeCommand(context);
            if (recognized && (!top || recognized.score > top.score)) {
                top = recognized;
            }
        }
        return top;
    }

}