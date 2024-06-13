import { IEnemyAsset } from "./EnemyAsset";
import { IMap } from "./Map";


export default class AssetLibrary 
{
    private static maps:IMap[] = [];
    private static enemies:IEnemyAsset[] = [];

    public static getMapById (id:string) : IMap|null
    {
        return this.maps.find (m => m.id === id) || null;
    }

    public static getEnemyById (id:string) : IEnemyAsset | null 
    {
        return this.enemies.find (e => e.id === id) || null;
    }
}