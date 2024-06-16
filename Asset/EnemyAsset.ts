import Asset, { IAsset } from "./Asset";


export interface IEnemyAsset extends IAsset
{
    level:number;
    xp:number;
    drops:IDropData[];
}


export interface IDropData 
{
    id:string;
    chance:number;
    min:number;
    max:number;

    getResult: () => IDropItem|null;
}
export interface IDropItem
{
    id:string;
    quantity:number;
}

export class DropItem implements IDropItem
{
    id:string;
    quantity: number;
}
export class DropData
{
    id:string;
    chance:number;
    min:number;
    max:number;

    getResult () :IDropItem|null
    {
        const roll =( Math.random () * 1) < this.chance;

        if (!roll)
            return null;

        const quantity = this.min + Math.ceil(Math.random () * (this.max - this.min)) ;

        const drop = new DropItem ();
        drop.id = this.id;
        drop.quantity = quantity;

        return drop;
    }
}

export default class EnemyAsset extends Asset implements IEnemyAsset
{
    level:number = 1;
    xp:number = 100;
    drops: IDropData[] = [];
}