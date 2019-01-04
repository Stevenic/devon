import { TurnContext, RecognizerResult } from 'botbuilder';
import { ComponentDialog } from 'botbuilder-dialogs';
import parseArgsStringToArgv = require('string-argv');
import { Recognizer, NONE_INTENT } from './recognizer';
import { SkillSet } from './skillSet';

export interface RecognizedCommand {
    score: number;
    dialogId: string;
    dialogOptions?: any;
} 

export abstract class CustomSkillCommand extends ComponentDialog {
    private _parent: SkillSet;
    public recognizer: Recognizer|undefined;
    public intentName: string|undefined;

    constructor(dialogId: string) {
        super(dialogId);
    }

    public get parent(): SkillSet {
        return this._parent;
    }

    public set parent(value: SkillSet) {
        this._parent = value;
        if (this._parent) {
            this.addDialog(this._parent);
        }
    }

    public async recognizeCommand(context: TurnContext, utterance?: string): Promise<RecognizedCommand|undefined> {
        utterance = utterance || context.activity.text || '';
        const noneIntent = { text: utterance, intents: { [NONE_INTENT]: { score: 0.0 }}};
        const recognized = this.recognizer ? await this.recognizer.recognize(context, utterance) : noneIntent;
        return await this.onRecognizeCommand(context, utterance, recognized);
    }

    protected abstract onRecognizeCommand(context: TurnContext, utterance: string, recognized: RecognizerResult): Promise<RecognizedCommand|undefined>;
}
