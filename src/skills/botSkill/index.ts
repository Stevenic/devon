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
            return await step.prompt('choices', { prompt: 'Choose subscription:', choices: subs })
        });
        createBot.addProcessingStep(async (step) => {
            const sub = step.result.value;
            await spawnCmd(`az account set -s "${sub}"`);
            const groups = await spawnCmd<string[]>('az group list --query [*].name');
            return await step.next(groups);
        });
        createBot.addProcessingStep(async (step) => {
            const groups = step.result;
            return await step.prompt('choices', { prompt: 'Choose resource group:', choices: groups });
        });
        createBot.addProcessingStep(async (step) => {
            const group = step.result.value;
            await spawnCmd(`az configure --defaults group=${group}`);
            const accessToken = await spawnCmd<string>('az account get-access-token --query accessToken');
            return await step.next(accessToken);
        });
        createBot.addProcessingStep(async (step) => {
            const accessToken = step.result;
            const luisAuthKey = await spawnCmd<string>(`curl https://api.luis.ai/api/v2.0/bots/programmatickey  -H "Authorization:Bearer ${accessToken}"`);
            return await step.next(luisAuthKey);
        });
        createBot.addDialog(new ChoicePrompt('choices'));
        this.addCommand(createBot);
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('CreateBot', /(?:create|make) .*(?:bot|agent|assistant) .*(?:named|called) (.*)/i, ['botName']);
