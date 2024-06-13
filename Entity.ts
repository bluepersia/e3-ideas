
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
    id:string;
    name:string; 
    level:number;

    state:EntityState = EntityState.Idle;
    
}