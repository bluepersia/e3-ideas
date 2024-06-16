import ActiveStat from "./ActiveStat";


export default class XPStat extends ActiveStat
{
    override set current (value:number)
    {
        while (value >= this.max)
        {
            value -= this.max;
            this.owner.level++;
        }
        this._current = value;
    }

    override get max () : number 
    {
        return (600 * (this.owner.level > 1 ? Math.pow (1.5, this.owner.level - 1) : 1));
    }
} 