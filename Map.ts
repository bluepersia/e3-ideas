import Asset from "./Asset";
import Room, { RoomBattle } from "./Room";


export default class MapBase extends Asset
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

export class MapBattle extends MapBase
{
    newRoom(): Room {
        return new RoomBattle (this);
    }
}

export class MapPVP extends MapBattle
{
    size:number = 4;

    override getSpace () : number 
    {
        return this.size * 2;
    }
}