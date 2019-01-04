import { Skill } from '../skill';
import { GetAccessTokenSkillCommand } from './getAccessTokenSkillCommand';
import { ListResourceGroupsSkillCommand } from './listResourceGroupsSkillCommand';
import { LoginSkillCommand } from './loginSkillCommand';

export class AZCliSkill extends Skill {
    constructor(dialogId: string) {
        super(dialogId);

        this.addCommand(
            new GetAccessTokenSkillCommand('accessTokenCommand'),
            new LoginSkillCommand('loginCmd'),
            new ListResourceGroupsSkillCommand('listGroupCmd')
        );
    }
}
