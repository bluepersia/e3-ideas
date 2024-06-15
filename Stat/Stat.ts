export interface IStat
{
    base:number;
    add:number;
    mult:number;
    value:number;

    onChangeEvent:((stat:IStat) => void)[];
}


export default class Stat implements IStat
{
    public onChangeEvent:((stat:IStat) => void)[];
    private _base:number = 0;
    get base () : number 
    {
        return this._base;
    }

    set base(value:number)
    {
        this._base = value;
        this.onChangeEvent.forEach (el => el (this));
    }

    private _add:number = 0;
    get add () : number 
    {
        return this._add;
        this.onChangeEvent.forEach (el => el (this));
    }

    set add (value:number) 
    {
        this._add = value;
    }
    private _mult:number = 1;
    get mult () : number 
    {
        return this._mult;
        this.onChangeEvent.forEach (el => el (this));
    }

    set mult (value:number) 
    {
        this._mult = value;
    }
    
    get value () : number 
    {
        return (this.base + this.add) * this.mult;
    }

    constructor (base:number = 0)
    {
        this.base = base;
    }

}