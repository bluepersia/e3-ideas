import PlayerStat from "./PlayerStat";

export default class Attacktat extends PlayerStat 
{

    
    public get base() : number {
        const end = this.character.stats.get (this.character.isMage ? 'intelligence' : 'endurance')!.value;

        return (end * 1) + (Math.pow (1.5, this.character.level - 1) );
    }
    
}