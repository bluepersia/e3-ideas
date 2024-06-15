import { IEntity } from "../Entity";
import ActiveStat from "./ActiveStat";


export default class ActiveManaStat extends ActiveStat
{
    override get max () : number 
    {
        return this.owner.stats.get ('mana')!.value;
    }

    constructor (owner:IEntity)
    {
        super (owner);
    }

     override initialize(): void {
        this.owner.stats.get ('mana')!.onChangeEvent.push (stat => this.onMaxChangeEvent.forEach (el => el (this)));
    }
}