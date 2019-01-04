import { spawnCmd } from '../../spawnCmd';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

interface LoginOption {
    login: string
}

const DEFAULT_RECOGNIZER = new RegExpRecognizer()
    .addIntent('Login', /(?:login|signin|sign me in|log me in|log in|sign in)/i, ['login'])
    .addIntent('Login', /(loginRequired)/, ['loginRequired']);

export class LoginSkillCommand extends SkillCommand<LoginOption> {
    constructor(dialogId: string, recognizer: Recognizer = DEFAULT_RECOGNIZER) {
        super(dialogId, 'sign into azure');
        this.recognizer = recognizer;
        this.intentName = 'Login';
        this.addOption(
            {
                type: SkillCommandOptionType.string,
                name: 'login',
                choices: [{ value: 'yes' }, { value: 'no' }],
                defaultOption: true,
                required: true,
                entityName: 'login',
                prompt: 'Login will launch a browser window. Proceed?'
            },
            {
                type: SkillCommandOptionType.string,
                name: 'loginRequired',
                choices: [{ value: 'yes' }, { value: 'no' }],
                defaultOption: true,
                required: false,
                entityName: 'LoginRequired',
                prompt: 'Login is required. Shall I launch a browser window?'
            }
        );

        this.addProcessingStep(
            async (step) => {
                if (step.options.login === 'yes') {
                    const result = await spawnCmd('az login');
                    return await step.next(result);
                }
                return await step.next();
            },
            async step => {
                const { result } = step;
                const message = result ? 'Login succeeded.' : 'Login failed.';
                await step.context.sendActivity(message);
                return step.next();
            });
    }
}
