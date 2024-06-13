import Asset, { IAsset } from "./Asset";


export interface IEnemyAsset extends IAsset
{
    level:number;
}

export default class EnemyAsset extends Asset implements IEnemyAsset
{
    level:number = 1;
}