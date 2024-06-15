import Item, { IItem } from "./Item";


export interface IInventory 
{
    items:(IItem|null)[];
    maxCount:number;

    countSpaceFor: (item:IItem) => number;
    addItem: (item:IItem) => number;
    countItem: (item:IItem) => number;
    setItem: (index:number, item:IItem) => number;
}


export default class Inventory implements IInventory
{
    private _items:(IItem|null)[] = [];

    public get items() :(IItem|null)[]
    {
        return this._items;
    }
    maxCount:number = 40;


    constructor ()
    {
        for (let i = 0; i < this.maxCount; i++)
            this._items.push (null);
    }

    countSpaceFor (item:IItem) : number
    {
        let counter = 0;
        for (const inventoryItem of this._items)
        {
            if (inventoryItem === null)
                counter += item.quantityMax;
            else if (inventoryItem.id === item.id)
                counter += inventoryItem.spaceLeft;
        }

        return counter;
    }

  

    addItem (item:IItem) : number 
    {
        let count = 0;

        for (let i = 0; i < this._items.length; i++)
        {
            count += this.setItem (i, item);

            if (item.quantity <= 0)
                break;
        }
        return count;
    }


    countItem (item:IItem) : number 
    {
        return this._items.reduce ((prev, curr) => curr?.id === item.id ? prev + curr.quantity : prev , 0);
    }

    setItem (index:number, item:IItem) : number 
    {
        const inventoryItem = this._items[index];
        let count = 0;

        if (inventoryItem === null)
        {
            const clone = item.clone ();
            if (clone.quantity > clone.quantityMax)
                 clone.quantity = clone.quantityMax;
                
            this._items[index] = clone;
            count += clone.quantity;
            item.quantity -= clone.quantity;
        }
         else if (inventoryItem.id === item.id)
        {
            const added = inventoryItem.addToStack (item.quantity);
            item.quantity -= added;
            count += added;
        }

        return count;
    }
}