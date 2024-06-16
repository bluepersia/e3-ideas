import { IEntity } from "../../Entity";
import Item, { IItem } from "./Item";


export interface IEquipItem extends IItem
{
    equip: (target:IEntity) => void;
    unequip: (target:IEntity) => void;
}

export default class EquipItem extends Item
{

    equip (target:IEntity) : void 
    {

    }

    unequip (target:IEntity) : void 
    {
        
    }
}