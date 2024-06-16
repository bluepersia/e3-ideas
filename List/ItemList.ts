import { IItem } from "../Asset/Item/Item";

export interface IItemList
{
    items:(IItem|null)[];
    maxCount:number;

    onItemSetEvent: ((target:IItemList, index:number) => void)[];
    onQuantityChangedEvent: ((target:IItemList, index:number) => void)[];

    countItem: (item:IItem) => number;
    countSpaceFor: (item:IItem) => number;
    setItem: (index:number, item:IItem|null) => TransferType;
    swapItems: (other:IItemList, otherIndex:number, index:number) => void;
    addItem: (item:IItem) => void;

    validate: (item:IItem|null, index:number) => boolean;
    validateAndSetItem: (index:number, item:IItem|null) => TransferType;
    //onItemSet: (index:number, prev:IItem|null, curr:IItem|null) => void;

}

export enum TransferType 
{
    None,
    Stacked,
    Replaced
}

export default class ItemList implements IItemList
{
    protected _items:(IItem|null)[] = [];

    public get items() :(IItem|null)[]
    {
        return this._items;
    }

    maxCount:number = 10;

    onItemSetEvent: ((target:IItemList, index: number) => void)[] = [];
    onQuantityChangedEvent: ((target: IItemList, index: number) => void)[] = [];

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

        if (prev)
            prev.onQuantityChangedEvent = [];
        
        //Listen for quantity changes
        if (item)
            item.onQuantityChangedEvent = [() => {

                if (item.quantity <= 0)
                {
                    this.setItem (index, null);
                    return;
                }

                this.onQuantityChanged (index);
        }]

        this.onItemSet (index, prev, item);
    }

    public setItem (index:number, item:IItem|null) : TransferType
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

    validateAndSetItem (index:number, item:IItem|null) : TransferType 
    {
        if (!this.validate (item, index))
            return TransferType.None;

        return this.setItem (index, item);
    }

    swapItems (other: IItemList, otherIndex: number, index: number) : void
    {
        const otherItem = other.items[otherIndex]!;
        const thisItem = this.items[index];

        if (this.validate (otherItem, index) && other.validate (thisItem, index))
        {
            //If item was replaced, we swap them out
            if (this.setItem (index, otherItem) === TransferType.Replaced && thisItem)
                other.setItem (otherIndex, thisItem);
        }
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

   


    public validate (item: IItem|null, index: number) : boolean
    {
        return true;
    }

    protected onItemSet (index: number, prev: IItem | null, curr: IItem | null) : void
    {
        this.onItemSetEvent.forEach (el => el (this, index));
    }

    protected onQuantityChanged (index:number) : void 
    {
        this.onQuantityChangedEvent.forEach (el => el (this, index));
    }
    
   
}