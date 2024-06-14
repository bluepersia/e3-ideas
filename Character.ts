import Entity, { IEntity } from "./Entity";
import { IRoomBattle } from "./Room";
import { ISkill } from "./Skill";

export interface ICharacter  extends IEntity
{
    getSkillById: (skillId:string) => ISkill|null;

    useSkill: (room:IRoomBattle, skillId:string, targetGroupIndex:number, targetIndex:number) => string;
}

export default class Character extends Entity implements ICharacter {

    get id () : string 
    {
        return this.name;
    }

    getSkillById (skillId:string) : ISkill | null
    {
        return this.skills.find (s => s.id === skillId) || null;
    }

    useSkill (room:IRoomBattle, skillId:string, targetGroupIndex:number, targetIndex:number) : string
    {
        if (room.getCurrentTurnEntity () !== this)
            return 'Not your turn!';

        const skill = this.getSkillById (skillId);

        if (!skill)
            return 'You do not have this skill!';
        
        return this.action (room, skill, targetGroupIndex, targetIndex);
    }
}