import { IItem } from "../Asset/Item/Item";
import { ICharacter } from "../Character";

export interface IList
{
    items:(IItem|null)[];
    maxCount:number;
    parent:ICharacter;

    onItemSetEvent: ((target:IList, index:number) => void)[];

    countItem: (item:IItem) => number;
    countSpaceFor: (item:IItem) => number;
    setItem: (index:number, item:IItem|null) => number;
    swapItems: (other:IList, otherIndex:number, index:number) => void;
    addItem: (item:IItem) => number;

    validate: (item:IItem, index:number) => boolean;
    onItemSet: (index:number, prev:IItem|null, curr:IItem|null) => void;

}

export default class List implements IList
{
    protected _items:(IItem|null)[] = [];
    public parent:ICharacter;

    public get items() :(IItem|null)[]
    {
        return this._items;
    }

    maxCount:number = 10;

    onItemSetEvent: ((target:IList, index: number) => void)[] = [];

    constructor (parent:ICharacter)
    {
        this.parent = parent;
        
        for (let i = 0; i < this.maxCount; i++)
            this._items.push (null);
    }

    
    countItem (item:IItem) : number 
    {
        return this._items.reduce ((prev, curr) => curr?.id === item.id ? prev + curr.quantity : prev , 0);
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

    private innerSetItem (index:number, item:IItem|null) : void 
    {
        const prev = this._items[index];
        this._items[index] = item;
        this.onItemSet (index, prev, item);
    }

    setItem (index:number, item:IItem|null) : number 
    {
        if (item === null)
        {
            this.innerSetItem (index, null);
            return 0;
        }
        const inventoryItem = this._items[index];
        let count = 0;

        if (inventoryItem === null || inventoryItem.id !== item.id)
        {
            const clone = item.clone ();
            if (clone.quantity > clone.quantityMax)
                 clone.quantity = clone.quantityMax;
                
            this.innerSetItem (index, clone);
            count += clone.quantity;
            item.quantity -= clone.quantity;
        }
         else if (inventoryItem.id === item.id)
        {
            const added = inventoryItem.addToStack (item.quantity);
            item.quantity -= added;
            count += added;
            this.innerSetItem (index, inventoryItem);
        }

        return count;
    }

    swapItems (other: IList, otherIndex: number, index: number) : void
    {
        const otherItem = other.items[otherIndex]!;
        const thisItem = this.items[index];

        this.setItem (index, otherItem);

        if (thisItem === null || otherItem.id !== thisItem.id)
            other.setItem (otherIndex, thisItem);
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


    validate (item: IItem, index: number) : boolean
    {
        return true;
    }

    onItemSet (index: number, prev: IItem | null, curr: IItem | null) : void
    {
        this.onItemSetEvent.forEach (el => el (this, index));
    }
}