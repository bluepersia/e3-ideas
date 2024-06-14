import Entity, { IEntity } from "./Entity";
import { ISkill } from "./Skill";

export interface ICharacter  extends IEntity
{
    getSkillById: (skillId:string) => ISkill|null;
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


}