import { ChoicePrompt } from 'botbuilder-dialogs';
import { spawnCmd } from '../../spawnCmd';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { Skill } from '../skill';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class BotSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer || defaultRecognizer);

        // Add skill commands
        const createBot = new SkillCommand('creatBot', 'createbot', 'mkbot');
        createBot.intentName = 'CreateBot';
        createBot.addOption({
            name: 'botName',
            type: SkillCommandOptionType.string,
            defaultOption: true,
            required: true,
            entityName: 'botName'
        });
        createBot.addProcessingStep(async (step) => {
            await spawnCmd('az login');
            return await step.next();
        });
        createBot.addProcessingStep(async (step) => {
            const subs = await spawnCmd<string[]>('az account list --query [*].name');
            return await step.next(subs);
        });
        createBot.addProcessingStep(async (step) => {
            const subs = step.result;
            // TODO: how to ask the user to choose one of subs
            await spawnCmd(`az account set -s "${subs[0]}"`);
            const groups = await spawnCmd<string[]>('az group list --query [*].name');
            return await step.next(groups);
        });
        createBot.addProcessingStep(async (step) => {
            const groups = step.result;
            await spawnCmd(`az configure --defaults group=${groups[0]}`);
            return await step.endDialog();
        })
        this.addCommand(createBot);
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('CreateBot', /(?:create|make) .*(?:bot|agent|assistant) .*(?:named|called) (.*)/i, ['botName']);
