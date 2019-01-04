import { ActivityTypes, ConversationState, MemoryStorage, AutoSaveStateMiddleware } from 'botbuilder';
import { ConsoleAdapter } from './consoleAdapter';
import { SkillSet, ShellSkill, FileSystemSkill, SampleSkill } from './skills';
import chalk from 'chalk';
import { DialogTurnStatus } from 'botbuilder-dialogs';

const adapter = new ConsoleAdapter();

const convoState = new ConversationState(new MemoryStorage());
adapter.use(new AutoSaveStateMiddleware(convoState));

const skills = new SkillSet(convoState.createProperty('skillState'));
skills.addSkill(new ShellSkill('shell'), new FileSystemSkill('files'), new SampleSkill('sample'));

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

