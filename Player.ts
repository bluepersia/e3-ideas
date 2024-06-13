import Character from "./Character";
import MapBase from "./Map";


export interface IPlayer 
{
    character:Character;

    hasUnlockedMap: (map:MapBase) => boolean;

    send:(msgId:string, ...values:string[]) => void;
}

export default class Player 
{
    character:Character = new Character ();

    public hasUnlockedMap (map:MapBase) : boolean
    {
        return true;
    }

    public send (msgId:string, ...values:string[]) : void 
    {
        
    }
}