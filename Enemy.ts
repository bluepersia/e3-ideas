import { IEnemyAsset } from "./EnemyAsset";
import Entity, { IEntity } from "./Entity";
import { IRoomBattle } from "./Room";
import { TargetType } from "./Skill";


export interface IEnemy extends IEntity
{
    Import:(asset:IEnemyAsset) => void;
}

export default class Enemy extends Entity
{

    
    constructor (asset:IEnemyAsset) 
    {
        super ();

        this.Import (asset);
    }

    Import (asset:IEnemyAsset) : void 
    {
        
    }

    override onTurn(room: IRoomBattle): void {
        const skillRnd = this.skills[Math.floor (Math.random () * this.skills.length)];

        let targetGroupIndex =room.turnGroup;
        if (skillRnd.targetType === TargetType.Opponent)
           targetGroupIndex = room.turnGroup === 0 ? 1 : 0;
        

        const targetGroup = room.board[targetGroupIndex];
        const targetsPotential:number[] = [];

       targetGroup.forEach ((bp, index) =>
        {
            if (bp.entity)
                targetsPotential.push (index);
        }
       );

       const targetRnd = targetsPotential[Math.floor (Math.random() * targetsPotential.length)];

        this.action (room, skillRnd, targetGroupIndex, targetRnd);
    }
}