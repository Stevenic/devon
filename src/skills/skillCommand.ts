import { TurnContext, RecognizerResult } from 'botbuilder';
import { ComponentDialog } from 'botbuilder-dialogs';
import parseArgsStringToArgv = require('string-argv');


export interface Recognizer {
    recognize(context: TurnContext): Promise<RecognizerResult>;
}

export interface RecognizedCommand {
    score: number;
    dialogId: string;
    dialogOptions?: any;
} 

export const NONE_INTENT = 'None';

export abstract class SkillCommand extends ComponentDialog {
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

    static topIntent(recognized: RecognizerResult): { name: string, score: number } {
        let top = NONE_INTENT;
        let topScore = 0;
        if (recognized && recognized.intents) {
            for (const name in recognized.intents) {
                const score = recognized.intents[name].score;
                if (score > topScore) {
                    top = name;
                    topScore = score;
                }
            }
        }
        return { name: top, score: topScore };
    }

    static getEntity(recognized: RecognizerResult, name: string, defaultValue?: any): any {
        let value = defaultValue;
        if (recognized && recognized.entities && recognized.entities.hasOwnProperty(name)) {
            value = recognized.entities[name];
        }
        return value;
    }

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