import AssetLibrary from "./Asset/AssetLibrary";
import { ICharacter } from "./Character";
import { IDropData, IEnemyAsset } from "./Asset/EnemyAsset";
import Entity, { IEntity } from "./Entity";
import { IRoomBattle } from "./Room";
import { TargetType } from "./Asset/Skill";


export interface IEnemy extends IEntity
{
    drops:IDropData[];

    import:(asset:IEnemyAsset) => void;
    drop: (target:IEntity) => void;
}

export default class Enemy extends Entity
{
    xp:number = 0;
    drops:IDropData[] = [];

    constructor (asset:IEnemyAsset) 
    {
        super ();

        this.import (asset);
    }

    import (asset:IEnemyAsset) : void 
    {
        this.name = asset.id;
        this.level = asset.level;
        this.xp = asset.xp;
        this.drops = asset.drops;
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


    drop (target:ICharacter) : void 
    {
        let xpMult= this.level - target.level;
        if (xpMult > 4)
            xpMult = 4;
        else if (xpMult < 0)
            xpMult = 0;

        target.xp.current += (this.xp * xpMult);

        const items = this.drops.map (drop => drop.getResult ()).filter (drop => drop !== null).map (drop => {
            const item = AssetLibrary.getItemById (drop!.id);
            item!.quantity = drop!.quantity;
            return item;
        });

        for (const item of items)
            target.loot.addItem (item!);

    }

}