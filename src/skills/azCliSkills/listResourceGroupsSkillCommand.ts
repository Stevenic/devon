import { WaterfallDialog } from 'botbuilder-dialogs';
import { spawnCmd } from '../../spawnCmd';
import { RegExpRecognizer } from '../regExpRecognizer';
import { SkillCommand } from '../skillCommand';

interface ListResourceGroupsOption {

}

const DEFAULT_RECOGNIZER = new RegExpRecognizer()
    .addIntent('ListAccounts', /(?:list|show) .*(?:accounts)/i, ['ListAccounts']);

export class ListResourceGroupsSkillCommand extends SkillCommand<ListResourceGroupsOption> {
    constructor(dialogId: string) {
        super(dialogId, 'list azure resource groups');

        this.recognizer = DEFAULT_RECOGNIZER;
        this.intentName = 'ListAccounts';

        this.addProcessingStep(
            async step => {
                return await step.beginDialog('checkLogin');
            },
            async step => {
                return await step.beginDialog('listAccounts');
            });

        this.addDialog(new WaterfallDialog('checkLogin', [
            async (step) => await this.beginCommand(step, `show access token`),
            async (step) => await step.endDialog()
        ]));

        this.addDialog(new WaterfallDialog('listAccounts', [
            async step => {
                const { result: accessToken } = step;
                if (!accessToken) {
                    await step.context.sendActivity('Looks like you need to login first.');
                    return await this.beginCommand(step, 'login');
                }
                return await step.next();
            },

            async step => {
                let result = null;
                try {
                    result = await spawnCmd('az account list --query [*].name');
                    process.stdout.write(JSON.stringify(result, null, 2));
                } catch (err) {
                    debugger;
                }
                return await step.next(result);
            }
        ]));
    }
}
