import { IItem} from "../Asset/Item/Item";
import { IEquipItem } from "../Asset/Item/EquipItem";
import List, { IList } from "./List";


export interface IEquipment extends IList
{

}


export default class Equipment extends List implements IEquipment 
{
    override onItemSet(index: number, prev: IItem | null, curr: IItem | null): void {
        
        if (prev === curr)
            return;

        const prevEquip = prev as IEquipItem;

        if (prevEquip)
            prevEquip.unequip (this.parent);

        const currEquip = curr as IEquipItem;

        if (currEquip)
            currEquip.equip (this.parent);
    }
}