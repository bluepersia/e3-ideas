import { IEntity } from "../../Entity";
import Item, { IItem } from "./Item";


export interface IEquipItem extends IItem
{
    level:number;
    equipIndexes:number[];

    validateEquip: (target:IEntity, index:number) => boolean;
    equip: (target:IEntity) => void;
    unequip: (target:IEntity) => void;
}

export default class EquipItem extends Item
{
    level:number = 1;
    equipIndexes:number[] = [];

    validateEquip (target:IEntity, index:number) : boolean
    {
        return this.equipIndexes.includes (index) && target.level >= this.level;
    }

    equip (target:IEntity) : void 
    {

    }

    unequip (target:IEntity) : void 
    {
        
    }
}