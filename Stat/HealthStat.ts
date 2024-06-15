import PlayerStat from "./PlayerStat";

export default class HealthStat extends PlayerStat 
{

    
    public get base() : number {
        const end = this.character.stats.get ('endurance')!.value;

        return (end * 10) + (Math.pow (1.5, this.character.level - 1) );
    }
    
}