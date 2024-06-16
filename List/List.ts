import { IItem } from "../Asset/Item/Item";
import { ICharacter } from "../Character";

export interface IList
{
    items:(IItem|null)[];
    maxCount:number;

    onItemSetEvent: ((target:IList, index:number) => void)[];

    countItem: (item:IItem) => number;
    countSpaceFor: (item:IItem) => number;
    setItem: (index:number, item:IItem|null) => TransferType;
    swapItems: (other:IList, otherIndex:number, index:number) => void;
    addItem: (item:IItem) => void;

    validate: (item:IItem, index:number) => boolean;
    //onItemSet: (index:number, prev:IItem|null, curr:IItem|null) => void;

}

export enum TransferType 
{
    None,
    Stacked,
    Replaced
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

    constructor ()
    {
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

        //Listen for quantity changes
        if (prev)
            prev.onQuantityChangedEvent = [];
        
        if (item)
            item.onQuantityChangedEvent = [() => {

                if (item.quantity <= 0)
                {
                    this.setItem (index, null);
                    return;
                }

                this.onItemSet (index, item, item);
        }]

        this.onItemSet (index, prev, item);
    }

    setItem (index:number, item:IItem|null) : TransferType 
    {
        if (item === null)
        {
            this.innerSetItem (index, null);
            return TransferType.Replaced;
        }
        const inventoryItem = this._items[index];
        //let count = 0;

        if (inventoryItem === null || inventoryItem.id !== item.id)
        {
            const clone = item.clone ();

            //Commented out as items check for quantity internally
            //if (clone.quantity > clone.quantityMax)
                 //clone.quantity = clone.quantityMax;

            this.innerSetItem (index, clone);
            //count += clone.quantity;
            item.quantity -= clone.quantity;

            return TransferType.Replaced;
        }
         else if (inventoryItem.id === item.id)
        {
            const added = inventoryItem.addToStack (item.quantity);
            item.quantity -= added;
            return TransferType.Stacked;
            //count += added;
        }
        return TransferType.None;
    }

    swapItems (other: IList, otherIndex: number, index: number) : void
    {
        const otherItem = other.items[otherIndex]!;
        const thisItem = this.items[index];

        //If item was replaced, we swap them out
        if (this.setItem (index, otherItem) === TransferType.Replaced)
            other.setItem (otherIndex, thisItem);
    }

   

    addItem (item:IItem) : void 
    {
        //let count = 0;

        for (let i = 0; i < this._items.length; i++)
        {
           // count += this.setItem (i, item);
           this.setItem (i, item);

            if (item.quantity <= 0)
                break;
        }
        //return count;
    }


    validate (item: IItem, index: number) : boolean
    {
        return true;
    }

    protected onItemSet (index: number, prev: IItem | null, curr: IItem | null) : void
    {
        this.onItemSetEvent.forEach (el => el (this, index));
    }
}