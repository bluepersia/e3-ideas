import { IEntity } from "../Entity";
import ActiveStat from "./ActiveStat";


export default class ActiveHealthStat extends ActiveStat
{
    override get max () : number 
    {
        return this.owner.stats.get ('health')!.value;
    }

    override initialize(): void {
        this.owner.stats.get ('health')!.onChangeEvent.push (stat => this.onMaxChangeEvent.forEach (el => el (this)))
    }
}