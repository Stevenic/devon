import { Recognizer } from '../recognizer';
import { Skill } from '../skill';
import { ListDirectoryCommand } from './listDirectoryCommand';
import { MakeDirectoryCommand } from './makeDirectoryCommand';
import { RemoveDirectoryCommand } from './removeDirectoryCommand';

export class FileSystemSkill extends Skill {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, recognizer);
    
        // Add skill commands
        this.addCommand(new ListDirectoryCommand('dir', recognizer));
        this.addCommand(new MakeDirectoryCommand('md', recognizer));
        this.addCommand(new RemoveDirectoryCommand('rd', recognizer));
    }
}
