import { ActivityTypes } from 'botbuilder';
import { ConsoleAdapter } from './consoleAdapter';
import chalk from 'chalk';

const adapter = new ConsoleAdapter().listen(async (context) => {
    if (context.activity.text === 'quit') {
        process.exit();
    } else {
        await context.sendActivity({ type: ActivityTypes.Typing });
        await context.sendActivity({ type: 'delay', value: 5000 });
        await context.sendActivity(chalk.blue(`you said: ` + context.activity.text));
    }
});

