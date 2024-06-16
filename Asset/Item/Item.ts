import Asset, { IAsset } from "../Asset";
import { ICloneable } from "../../Cloneable";


export interface IItem extends IAsset, ICloneable<IItem>
{
    quantity:number;
    quantityMax:number; 
    spaceLeft:number;

    onQuantityChangedEvent: (() => void)[];

    addToStack: (count:number) => number;
    getData: () => IItemData;
}

export interface IItemData 
{
    id:string;
    quantity:number;
}

export class ItemData implements IItemData 
{
    constructor (public id:string, public quantity:number) {}
}


export default class Item extends Asset implements IItem
{
    private _quantity:number = 1;
    get quantity () : number 
    {
        return this._quantity;
    }
    set quantity (value:number) 
    {
        if (value === this._quantity)
            return;

        this._quantity = value;
        this.onQuantityChangedEvent.forEach (el => el ());
    }
    quantityMax:number = 1;

    onQuantityChangedEvent: (() => void)[] = [];

    get spaceLeft () : number 
    {
        return this.quantityMax - this.quantity;
    }


    addToStack (count:number) : number 
    {
        let quantity = this.quantity + count;

        if (quantity > this.quantityMax)
        {
            const excess = quantity - this.quantityMax;
            quantity = this.quantityMax;
            count -= excess;
        }

        return count;
    }


    clone () : IItem
    {
        const newItem = Object.create (this) as IItem;
        return newItem;
    }


    getData () : IItemData
    {
        return new ItemData (this.id, this.quantity);
    }
}