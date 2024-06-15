import { IEntity } from "../Entity";

export interface IActiveStat 
{
    current:number;
    max:number;
    onCurrentChangeEvent:((activeStat:IActiveStat) => void)[];
    onMaxChangeEvent:((activeStat:IActiveStat) => void)[];

    initialize: () => void;
}


export default abstract class ActiveStat implements IActiveStat
{
    protected owner:IEntity;
    public onCurrentChangeEvent:((activeStat:IActiveStat) => void)[];
    public onMaxChangeEvent:((activeStat:IActiveStat) => void)[];

    private _current:number;
    
    get current () : number 
    {
        return this.current;
    }

    set current (value:number)
    {
        this._current = value;
        this.onCurrentChangeEvent.forEach (el => el (this));
    }

    get max () : number 
    {
        return 0;
    }

    constructor (owner:IEntity)
    {
        this.owner = owner;
        this._current = this.max;
    }

    initialize () : void 
    {
        
    }
}