
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
    Action
}
export default class Entity implements IEntity
{
    id:string;
    name:string; 
    level:number;

    state:EntityState = EntityState.Idle;
    
}