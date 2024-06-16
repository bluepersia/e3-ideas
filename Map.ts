import Asset, { IAsset } from "./Asset/Asset";
import Room, { IRoom, RoomBattle } from "./Room";

export interface IMap extends IAsset
{
    requiresUnlock:boolean;
    
    getSpace: () => number;
    newRoom: () => IRoom;
}


export default class MapBase extends Asset implements IMap
{
    requiresUnlock:boolean = true;

    getSpace () : number
    {
        return 4;
    }

    newRoom () : IRoom
    {
        return new Room<MapBase> (this);
    }

    
}

export interface IMapTown extends IMap 
{
    maxPlayers:number;
}

export class MapTown extends MapBase implements IMapTown 
{
    maxPlayers: number = 40;

     override getSpace(): number {
        return this.maxPlayers;
    }
}

export interface IMapBattle extends IMap
{
    getSizeAt: (groupIndex:number, waveIndex:number) => number;
}

export class MapBattle extends MapBase implements IMapBattle
{
    getSizeAt (groupIndex:number, waveIndex = 0) : number 
    {
        return groupIndex === 0 ? 4 : 0;
    }


}

export interface IMapPvE extends IMapBattle
{
    waves:SpawnData[][];

    newWaveIds: (waveIndex:number) => string[];
}

export class MapPvE extends MapBattle implements IMapPvE
{
    waves:SpawnData[][] = [];

    newWaveIds (waveIndex:number) : string[]
    {
        return this.waves[waveIndex].map (spawnData => spawnData.getRandomEnemyId ());
    }

    getSizeAt (groupIndex:number, waveIndex = 0) : number 
    {
        return groupIndex === 0 ? 4 : this.waves[waveIndex].length;
    }

    newRoom(): IRoom {
        return new RoomBattle (this);
    }
}


interface ISpawnData 
{
    ids:string[];
    chances:number[];

    getRandomEnemyId:  () => string;
}

class SpawnData implements ISpawnData
{
    ids:string[] = [];
    chances:number[] = [];

    getRandomEnemyId () : string 
    {
        let current = 0;
        let id = '';
        const roll = Math.random () * 1;
        for (let i = 0; i < this.chances.length; i++)
        {
            if (roll < (current + this.chances[i]))
            {
                id = this.ids[i];
                break;
            }
        }

        return id;
    }
}

export class MapPVP extends MapBattle
{
    size:number = 4;

    override getSpace () : number 
    {
        return this.size * 2;
    }

    override  getSizeAt(groupdIndex:number, waveIndex = 0): number {
        return this.size;
    }

}