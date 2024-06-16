import Item, { IItem } from "../Asset/Item/Item";
import List, { IList } from "./List";


export interface IInventory extends IList
{

    
}


export default class Inventory extends List implements IInventory
{
    
    maxCount:number = 40;


    

  



   

   
}