import Asset, { IAsset } from "./Asset";
import { IEntity } from "./Entity";


export interface ISkill extends IAsset
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

export default class Skill extends Asset implements ISkill
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
}

export interface ISkillLevel 
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

export class SkillLevel implements ISkillLevel
{
    manaCost: number = 0;
    cooldown: number = 1;
    lastCast: number = -1;
    effects: ISkillEffect[] = [];

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
        return targets.map (t => new SkillEffectData (this.time, t.id, 'NaN', this.value));
    }
    use () : void 
    {
    }
}

export class DealDamage extends SkillEffect
{

    override calculate(entity: IEntity, targets: IEntity[]): ISkillEffectData[] {
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

            //Take away health
    }
}