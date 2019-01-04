import { ActivityTypes, ConversationState, MemoryStorage, AutoSaveStateMiddleware } from 'botbuilder';
import { ConsoleAdapter } from './consoleAdapter';
import { BotSkill, FileSystemSkill, RootSkillSet } from './skills';
import chalk from 'chalk';
import { DialogTurnStatus } from 'botbuilder-dialogs';

const adapter = new ConsoleAdapter();

const convoState = new ConversationState(new MemoryStorage());
adapter.use(new AutoSaveStateMiddleware(convoState));

const skills = new RootSkillSet(convoState.createProperty('skillState'));
//skills.addSkill(new FileSystemSkill('files'));
skills.addSkill(new BotSkill('msbot'));

const initialMessage = process.argv.length > 2 ? process.argv.slice(2).join(' ') : undefined;
adapter.listen(async (context) => {
    if (context.activity.text === 'quit') {
        process.exit();
    } else {
        const result = await skills.run(context);
        if (result.status !== DialogTurnStatus.waiting) {
            process.exit();
        }
    }
}, initialMessage);
