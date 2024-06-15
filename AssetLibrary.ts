import { IEnemyAsset } from "./EnemyAsset";
import { IMap } from "./Map";
import { ISkill } from "./Skill";


export default class AssetLibrary 
{
    private static maps:IMap[] = [];
    private static enemies:IEnemyAsset[] = [];
    private static skills : ISkill[] = [];

    public static getMapById (id:string) : IMap|null
    {
        return this.maps.find (m => m.id === id) || null;
    }

    public static getEnemyById (id:string) : IEnemyAsset | null 
    {
        return this.enemies.find (e => e.id === id) || null;
    }

    public static getSkillById (id:string) : ISkill | null 
    {
        const skill = this.skills.find (s => s.id === id);
        
        if (skill)
            return skill.duplicate ();

        return null;
    }
}