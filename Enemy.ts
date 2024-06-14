import { IEnemyAsset } from "./EnemyAsset";
import Entity, { IEntity } from "./Entity";


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
}