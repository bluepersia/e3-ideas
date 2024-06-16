import { IItem} from "../Asset/Item/Item";
import { IEquipItem } from "../Asset/Item/EquipItem";
import List, { IList } from "./List";
import { ICharacter } from "../Character";


export interface IEquipment extends IList
{
    parent:ICharacter;
}


export default class Equipment extends List implements IEquipment 
{
    constructor (parent:ICharacter) 
    {
        super ();
        this.parent = parent;
    }
     override validate(item: IItem, index: number): boolean {
        const equipItem = item as IEquipItem;

        if (!item)
            return false;

        return  equipItem.validateEquip (this.parent, index);
    }
    override onItemSet(index: number, prev: IItem | null, curr: IItem | null): void {
        
        super.onItemSet (index, prev, curr);
        
        if (prev === curr)
            return;

        (prev as IEquipItem).unequip (this.parent);
        (curr as IEquipItem).equip (this.parent);
    }
}