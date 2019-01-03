import { TurnContext, RecognizerResult } from 'botbuilder';

export interface Recognizer {
    recognize(context: TurnContext): Promise<RecognizerResult>;
}

export const NONE_INTENT = 'None';

export function topIntent(recognized: RecognizerResult): { name: string, score: number } {
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

export function getEntity(recognized: RecognizerResult, name: string, defaultValue?: any): any {
    let value = defaultValue;
    if (recognized && recognized.entities && recognized.entities.hasOwnProperty(name)) {
        value = recognized.entities[name];
    }
    return value;
}
