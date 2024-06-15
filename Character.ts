import Entity, { IEntity } from "./Entity";
import { IRoomBattle } from "./Room";
import { ISkill } from "./Skill";
import AttackStat from "./Stat/AttackStat";
import HealthStat from "./Stat/HealthStat";
import ManaStat from "./Stat/ManaStat";
import Stat, { IStat } from "./Stat/Stat";

export interface ICharacter  extends IEntity
{
    isMage:boolean;

    getSkillById: (skillId:string) => ISkill|null;

    useSkill: (room:IRoomBattle, skillId:string, targetGroupIndex:number, targetIndex:number) => string;
}

export default class Character extends Entity implements ICharacter {

    get id () : string 
    {
        return this.name;
    }

    get isMage () : boolean
    {
        return false;
    }

    stats = new Map<string, IStat>([
        ['strength', new Stat(5)],
        ['endurance', new Stat(5)],
        ['wisdom', new Stat(5)],
        ['intelligence', new Stat(5)],
        ['luck', new Stat(5)],
        ['health', new HealthStat(this)],
        ['mana', new ManaStat (this)],
        ['attack', new AttackStat(this)]
    ]);

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