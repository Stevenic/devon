import { AutoSaveStateMiddleware, ConversationState, MemoryStorage } from 'botbuilder';
import { DialogTurnStatus } from 'botbuilder-dialogs';
import { ConsoleAdapter } from './consoleAdapter';
import { FileSystemSkill, SampleSkill, ShellSkill, SkillSet } from './skills';
import { AZCliSkill } from './skills/azCliSkills';

const adapter = new ConsoleAdapter();

const convoState = new ConversationState(new MemoryStorage());
adapter.use(new AutoSaveStateMiddleware(convoState));

const skills = new SkillSet(convoState.createProperty('skillState'));
skills.addSkill(
    new ShellSkill('shell'),
    new FileSystemSkill('files'),
    new SampleSkill('sample'),
    new AZCliSkill('azCli')
);

const initialMessage = process.argv.length > 2 ? process.argv.slice(2).join(' ') : undefined;
adapter.listen(async (context) => {
    if (context.activity.text === 'quit') {
        process.exit();
    } else if (context.activity.text) {
        const result = await skills.run(context);
        if (result.status !== DialogTurnStatus.waiting) {
            process.exit();
        }
    }
}, initialMessage);
