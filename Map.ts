import Asset from "./Asset";
import Room from "./Room";


export default class GameMap extends Asset
{
    requiresUnlock:boolean = true;

    getSpace () : number
    {
        return 4;
    }

    newRoom () : Room
    {
        return new Room (this);
    }
}

export class MapBattle extends GameMap
{
}

export class MapPVP extends MapBattle
{
    size:number = 4;

    override getSpace () : number 
    {
        return this.size * 2;
    }
}