import { Recognizer } from '../recognizer';
import { Skill } from '../skill';
import { CreateCommand } from './createCommand';

export class SampleSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer);
    
        // Add skill commands
        this.addCommand(new CreateCommand('createCmd', recognizer));
    }
}
