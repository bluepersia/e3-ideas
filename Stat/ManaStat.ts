import PlayerStat from "./PlayerStat";

export default class ManaStat extends PlayerStat 
{

    
    public get base() : number {
        const end = this.character.stats.get ('wisdom')!.value;

        return (end * 3) * (this.character.level > 1 ? Math.pow (1.5, this.character.level - 1) : 1 );
    }
    
}