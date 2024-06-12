import Asset from "./Asset";


export default class GameMap extends Asset
{
    requiresUnlock:boolean = true;

    getSpace () : number
    {
        return 4;
    }

}

export class MapPVP extends GameMap
{
    size:number = 4;

    override getSpace () : number 
    {
        return this.size * 2;
    }
}