import { executeCmd } from '../../executeCmd';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand } from '../skillCommand';

const DEFAULT_RECOGNIZER = new RegExpRecognizer()
    .addIntent('AccessToken', /(?:list|show) .*(?:access|arm) .*(token)/i, ['accessToken']);

export class GetAccessTokenSkillCommand extends SkillCommand {
    constructor(dialogId: string) {
        super(dialogId);

        this.recognizer = DEFAULT_RECOGNIZER;
        this.intentName = 'AccessToken';

        this.addProcessingStep(
            async step => {
                await step.context.sendActivity('Checking for login...');
                let result = null;
                try {
                    result = await executeCmd('az account get-access-token');
                } catch (err) {
                    // Do nothing - the result is already null
                }

                return await step.next(result);
            }
        )
    }

}
