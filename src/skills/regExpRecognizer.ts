import { TurnContext, RecognizerResult } from 'botbuilder';
import { Recognizer, NONE_INTENT, topIntent } from './recognizer';

export class RegExpRecognizer implements Recognizer {
    private readonly intents: ((context: TurnContext) => Promise<RecognizerResult|undefined>)[] = [];

    public async recognize(context: TurnContext): Promise<RecognizerResult> {
        // Find top matching intent
        let top: RecognizerResult = { text: context.activity.text, intents: { [NONE_INTENT]: { score: 0.0 }}};
        let topScore = 0;
        for (let i = 0; i < this.intents.length; i++) {
            const recognized = await this.intents[i](context);
            const intent = topIntent(recognized);
            if (intent.score > topScore) {
                top = recognized;
                topScore = intent.score;
            }
        }
        return top;
    }

    public addIntent(name: string, expression: RegExp, entities?: string[]): this {
        this.intents.push(async (context) => {
            const utterance = context.activity.text || '';
            const matched = expression.exec(utterance);
            if (matched) {
                const score = matched[0].length / utterance.length;
                const result: RecognizerResult = {
                    text: utterance,
                    intents: { [name]: { score: score }},
                    entities: {}
                };
                if (matched.length > 1 && Array.isArray(entities)) {
                    // Map capture groups to named entities
                    for (let i = 1; i < matched.length && i < (entities.length + 1); i++) {
                        result.entities[entities[i - 1]] = matched[i];
                    }
                }
                return result;
            }
            return undefined;
        });
        return this;
    }
}

