import MapBase from "./Map";
import Player from "./Player";

export default class Room 
{
    id:string;
    map:MapBase;
    players:Player[] = [];

    constructor (map:MapBase)
    {
        this.id = Math.random().toString(16).slice(2);
        this.map = map;
    }

    hasSpace () : boolean
    {
        return this.players.length < this.map.getSpace ();
    }

    addPlayer (player:Player) : void 
    {
        this.players.push (player);
    }
}

export class RoomBattle extends Room
{

}

