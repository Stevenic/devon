import { ActivityTypes } from 'botbuilder';
import { ConsoleAdapter } from './consoleAdapter';
import chalk from 'chalk';

const initialMessage = process.argv.length > 2 ? process.argv.slice(2).join(' ') : undefined;
const adapter = new ConsoleAdapter().listen(async (context) => {
    if (context.activity.text === 'quit') {
        process.exit();
    } else {
        await context.sendActivity({ type: ActivityTypes.Typing });
        await context.sendActivity({ type: 'delay', value: 5000 });
        await context.sendActivity(chalk.blue(`you said: ` + context.activity.text));
    }
}, initialMessage);

