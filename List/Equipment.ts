import { IItem} from "../Asset/Item/Item";
import { IEquipItem } from "../Asset/Item/EquipItem";
import { ICharacter } from "../Character";
import ItemList, { IItemList } from "./ItemList";


export interface IEquipment extends IItemList
{
    parent:ICharacter;
}


export default class Equipment extends ItemList implements IEquipment 
{
    constructor (parent:ICharacter) 
    {
        super ();
        this.parent = parent;
    }
     override validate(item: IItem|null, index: number): boolean {

        if (item === null)
            return index != 0;

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