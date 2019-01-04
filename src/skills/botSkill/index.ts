import { ChoicePrompt, DialogTurnStatus } from 'botbuilder-dialogs';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { spawnCmd } from '../../spawnCmd';
import { Recognizer } from '../recognizer';
import { RegExpRecognizer } from '../regExpRecognizer';
import { Skill } from '../skill';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

const defaultAppId = '3c1a50a7-1e3c-4391-83c7-a0aa302d683f';
const defaultAppSecret = ')@@z9!1)Y*{;-?!]-6Hcsa[whV%#Q*;T((R}>%/>=.:w*.:*'

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
        createBot.addOption({
            name: 'path',
            type: SkillCommandOptionType.path,
            defaultOption: true,
            required: true,
            defaultValue: '.',
            entityName: 'Path'
        });
        createBot.addProcessingStep(async (step) => {
            const botDir = step.options['path'];
            const botName = step.options['botName'];
            const botIndex = resolve(botDir, botName, 'index.js');
            if (!existsSync(botIndex)) {
                await spawnCmd<any>('yo botbuilder', { cwd: resolve(botDir), interactive: true });
            }
            return await step.next();
        });
        createBot.addProcessingStep(async (step) => {
            let alreadyLoggedIn = false;
            try {
                const subId = await spawnCmd<string>('az account show --query id');
                alreadyLoggedIn = subId && subId.length > 0;
            } catch (ex) {
                alreadyLoggedIn = false;
            }
            if (!alreadyLoggedIn) {
                const subs = await spawnCmd<string[]>('az login --query [*].name');
                return await step.next(subs);
            } else {
                const subs = await spawnCmd<string[]>('az account list --query [*].name');
                return await step.next(subs);
            }
        });
        createBot.addProcessingStep(async (step) => {
            const subs = step.result;
            return await step.prompt('choices', { prompt: 'Choose subscription:', choices: subs })
        });
        createBot.addProcessingStep(async (step) => {
            const sub = step.result.value;
            await spawnCmd(`az account set -s "${sub}"`);
            //return await this.beginCommand(step, `call az account set -s "${sub}"`, {})
            const groups = await spawnCmd<string[]>('az group list --query [*].name');
            step.options['subscriptionId'] = await spawnCmd<string>('az account show --query id');
            return await step.next(groups);
        });
        createBot.addProcessingStep(async (step) => {
            const groups = step.result;
            return await step.prompt('choices', { prompt: 'Choose resource group:', choices: groups });
        });
        createBot.addProcessingStep(async (step) => {
            const group = step.result.value;
            step.options['resourceGroup'] = group;
            await spawnCmd(`az configure --defaults group=${group}`);
            const accessToken = await spawnCmd<string>('az account get-access-token --query accessToken');
            step.options['armToken'] = accessToken;
            return await step.next(accessToken);
        });
        createBot.addProcessingStep(async (step) => {
            const accessToken = step.result;
            const luisAuthKey = await spawnCmd<string>(`curl https://api.luis.ai/api/v2.0/bots/programmatickey  -H "Authorization:Bearer ${accessToken}"`);
            step.options['luisAuthKey'] = luisAuthKey;
            return await step.next(luisAuthKey);
        });
        createBot.addProcessingStep(async step => {
            const options = step.options
            const cwd = resolve(options['path'], options['botName']);
            const botFilePath = resolve(cwd, `${options['botName']}.bot`);
            if (existsSync(botFilePath)) {
                unlinkSync(botFilePath);
            }
            const bot = await spawnCmd<{}>(`msbot clone services -n ${options['botName']} --luisAuthoringKey "${options['luisAuthKey']}" --location westus --folder ./deploymentScripts/msbotClone --subscriptionId "${options['subscriptionId']}" --force --groupName "${options['resourceGroup']}" --sdkLanguage Node --appId "${defaultAppId}" --appSecret "${defaultAppSecret}"`,
                { cwd, interactive: true });
            return await step.next(bot);
        });
        createBot.addProcessingStep(async step => await step.endDialog());
        createBot.addDialog(new ChoicePrompt('choices'));
        this.addCommand(createBot);
    }
}

const defaultRecognizer = new RegExpRecognizer()
    .addIntent('CreateBot', /(?:create|make) .*(?:bot|agent|assistant) .*(?:named|called) (.*)/i, ['botName']);
