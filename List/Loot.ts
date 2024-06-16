import ItemList, { IItemList } from "./ItemList";


export interface ILoot extends IItemList
{
    takeAll: () => void;
}

export default class Loot extends ItemList 
{
    takeAll () : void 
    {
        for (let i = 0; i < this.items.length; i++)
        {
            let item = this.items[i];
            const prev = item;

            if (item === null)
                continue;

            this.parent.inventory.addItem (item);
            if (item.quantity <= 0)
                item = this.items[i] = null;

            this.onItemSet (i, prev, item);
        }
    }
}