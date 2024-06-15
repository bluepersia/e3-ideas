import Asset, { IAsset } from "./Asset";
import { IDuplicatable } from "./Duplicatable";
import { IEntity } from "./Entity";


export interface ISkill extends IAsset, IDuplicatable<ISkill>
{
    targetType:TargetType;
    levels: ISkillLevel[];
    levelCurrent: number;
    range:number;
    duration:number;
    isAoE:boolean;

    getCurrentLevel: () => ISkillLevel;
}

export enum TargetType
{
    Opponent,
    Ally,
    Self
}

export default class Skill extends Asset implements ISkill, IDuplicatable<ISkill>
{
    targetType:TargetType = TargetType.Opponent;
    levels:ISkillLevel[] = [];
    levelCurrent: number = 0;
    range:number = 10;
    duration: number = 10;
    isAoE: boolean = false;

    getCurrentLevel () : ISkillLevel
    {
        return this.levels[this.levelCurrent];
    }

    duplicate () : ISkill
    {
        const newSkill = new Skill ();
        newSkill.targetType = this.targetType;
        newSkill.levels = this.levels.map (l => l.duplicate ());
        newSkill.levelCurrent = this.levelCurrent;
        newSkill.range = this.range;
        newSkill.duration = this.duration;
        newSkill.isAoE = this.isAoE;
        return newSkill;
    }
}

export interface ISkillLevel extends IDuplicatable<ISkillLevel>
{
    manaCost:number;
    cooldown:number;
    effects:ISkillEffect[];

    isReady: (turnCount:number) => boolean;
    use: () => void;
    calculate: (entity:IEntity, targets:IEntity[]) => ISkillEffectData[][]
}

export interface ISkillEffectData 
{
    time:number;
    targetId:string;
    type:string;
    value:number;
}

export class SkillEffectData implements ISkillEffectData
{
    time:number = 0;
    targetId: string = '';
    type:string = '';
    value:number;

    constructor (time:number, targetId:string, type:string, value:number) 
    {
        this.time = time;
        this.targetId = targetId;
        this.type = type;
        this.value = value;
    }

}

export class SkillLevel implements ISkillLevel, IDuplicatable<ISkillLevel>
{
    manaCost: number = 0;
    cooldown: number = 1;
    lastCast: number = -1;
    effects: ISkillEffect[] = [];
    private caster:IEntity;

    isReady (turnCount:number) : boolean
    {
        return this.lastCast === -1 || turnCount - this.lastCast >= this.cooldown;
    }

    calculate (entity:IEntity, targets:IEntity[]) : SkillEffectData[][]
    {
        return this.effects.map (eff => eff.calculate (entity, targets))
    }  

    use () : void 
    {
        this.effects.forEach (eff => eff.use ());
        this.lastCast = Date.now ();
        this.caster.mana.current -= this.manaCost;
    }

    duplicate () : ISkillLevel
    {
        const newLevel = new SkillLevel ();
        newLevel.manaCost = this.manaCost;
        newLevel.cooldown = this.cooldown;
        newLevel.lastCast = this.lastCast;
        newLevel.effects = this.effects;
        return newLevel;
    }
}


export interface ISkillEffect 
{
    value:number;    
    calculatedData:Map<IEntity, number>;

    calculate:(entity:IEntity, targets:IEntity[]) => ISkillEffectData[];
    use: () => void;
}

export class SkillEffect implements ISkillEffect 
{
    value: number = 0;
    time:number = 0;
    
    
    calculatedData:Map<IEntity, number> = new Map<IEntity, number>;

    calculate(entity: IEntity, targets: IEntity[]): ISkillEffectData[]{
        this.calculatedData.clear ();

        return targets.map (t => new SkillEffectData (this.time, t.id, 'NaN', this.value));
    }
    use () : void 
    {
    }
}

export class DealDamage extends SkillEffect
{

    override calculate(entity: IEntity, targets: IEntity[]): ISkillEffectData[] {
       super.calculate (entity, targets);

        return targets.map (t => 
            {
                const dmgRange = (Math.random () * 0.2 ) - 0.1;
                let dmg = this.value + dmgRange;

                const isCritical = Math.random () < .5;

                if (isCritical)
                    dmg *= 2;

                this.calculatedData.set (t, dmg);

                return new SkillEffectData (this.time, t.id, 'dmg', dmg);
            });
    }

    use () : void
    {
        this.calculatedData.forEach ((dmg, entity) => entity.health.current -= dmg);
    }
}