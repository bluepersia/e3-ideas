import { IEntity } from "../../Entity";
import EquipItem, { IEquipItem } from "./EquipItem";


export interface IWeapon extends IEquipItem
{
    attack:number;
}

export default class Weapon extends EquipItem
{
    attack:number = 5;

    override equip(target: IEntity): void {
        target.stats.get ('attack')!.add += this.attack;
    }

    override unequip(target: IEntity): void {
        target.stats.get ('attack')!.add -= this.attack;
    }
}