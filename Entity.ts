
export interface IEntity 
{
    id:string;
    name:string;
    level:number;
    state:EntityState;
}

export enum EntityState 
{
    Idle,
    Action,
    RunningToNextWave
}
export default class Entity implements IEntity
{
    private _id:string;
    get id () : string 
    {
        return this._id;
    }

    set id (value:string) 
    {
        this._id = value;
    }
    name:string; 
    level:number;

    state:EntityState = EntityState.Idle;
    
}