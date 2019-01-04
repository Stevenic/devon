import { Recognizer } from '../recognizer';
import { Skill } from '../skill';
import { CreateCommand } from './createCommand';
import { GreetingCommand } from './greetingCommand';

export class SampleSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer);
    
        // Add skill commands
        this.addCommand(new CreateCommand('createCmd', recognizer));
        this.addCommand(new GreetingCommand('greetingCmd', recognizer));
    }
}
