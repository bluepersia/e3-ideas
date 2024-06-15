
import { ICharacter } from "../Character";
import Stat from "./Stat";

export default abstract class PlayerStat extends Stat
{
    character:ICharacter;

    constructor (character:ICharacter)
    {
        super ();
        this.character = character;
    }
}
