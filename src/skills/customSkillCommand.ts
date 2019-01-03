import { TurnContext, RecognizerResult } from 'botbuilder';
import { ComponentDialog } from 'botbuilder-dialogs';
import parseArgsStringToArgv = require('string-argv');
import { Recognizer, NONE_INTENT } from './recognizer';

export interface RecognizedCommand {
    score: number;
    dialogId: string;
    dialogOptions?: any;
} 

export abstract class CustomSkillCommand extends ComponentDialog {
    public recognizer: Recognizer|undefined;
    public intentName: string|undefined;

    constructor(dialogId: string) {
        super(dialogId);
    }

    public async recognizeCommand(context: TurnContext): Promise<RecognizedCommand|undefined> {
        const noneIntent = { text: context.activity.text, intents: { [NONE_INTENT]: { score: 0.0 }}};
        const recognized = this.recognizer ? await this.recognizer.recognize(context) : noneIntent;
        return await this.onRecognizeCommand(context, recognized);
    }

    protected abstract onRecognizeCommand(context: TurnContext, recognized: RecognizerResult): Promise<RecognizedCommand|undefined>;

    static utteranceToArgv(context: TurnContext): string[] {
        let argv: string[];
        if (context.turnState.has(CACHED_ARGV)) {
            argv = context.turnState.get(CACHED_ARGV);
        } else {
            const utterance = context.activity.text || '';
            argv = parseArgsStringToArgv(utterance, 'node', 'devon');
            context.turnState.set(CACHED_ARGV, argv);
        }
        return argv.slice(0);
    }
}

const CACHED_ARGV = Symbol('argv');