import Item, { IItem } from "../Asset/Item/Item";
import ItemList, { IItemList } from "./ItemList";


export interface IInventory extends IItemList
{

    
}


export default class Inventory extends ItemList implements IInventory
{
    
    maxCount:number = 40;


    

  



   

   
}