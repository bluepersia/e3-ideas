import Entity, { IEntity } from "./Entity";

export interface ICharacter  extends IEntity
{

}

export default class Character extends Entity implements ICharacter {

    get id () : string 
    {
        return this.name;
    }



}