import { Recognizer } from '../recognizer';
import { Skill } from '../skill';
import { EchoCommand } from './echoCommand'
import { SetCommand } from './setCommand';

export class ShellSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer);
    
        // Add skill commands
        this.addCommand(new EchoCommand('echo'));
        this.addCommand(new SetCommand('set'));
    }
}
