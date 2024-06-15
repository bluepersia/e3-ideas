import { BattlePiece } from "./Room";
import { ISkill, ISkillLevel, TargetType } from "./Skill";
import { IRoomBattle } from "./Room";
import Player from "./Player";
import Stat, { IStat } from "./Stat/Stat";
import ActiveHealthStat from "./ActiveStat/HealthStat";
import ActiveManaStat from "./ActiveStat/ManaStat";
import { IActiveStat } from "./ActiveStat/ActiveStat";
import { IList } from "./List";
import Inventory from "./Inventory";
import Equipment from "./Equipment";
import Loot from "./Loot";

export interface IEntity 
{
    id:string;
    name:string;
    level:number;
    skills:ISkill[];
    stats: Map<string, IStat>;
    health:IActiveStat;
    mana:IActiveStat;
    lists:Map<string, IList>;
    state:EntityState;
    isAlive:boolean;

    onTurn: (room:IRoomBattle) => void;
    action: (room:IRoomBattle, action:ISkill, targetGroupIndex:number, targetIndex:number) => string;
}

export enum EntityState 
{
    Idle,
    Action,
    RunningToNextWave
}


export default class Entity implements IEntity
{
    private _id:string;
    get id () : string 
    {
        return this._id;
    }

    set id (value:string) 
    {
        this._id = value;
    }
    name:string; 
    level:number;
    skills: ISkill[] = [];
    stats:Map<string, IStat> = new Map<string, IStat> ();

    health:ActiveHealthStat = new ActiveHealthStat (this);
    mana:ActiveManaStat = new ActiveManaStat (this);

    lists:Map<string, IList> = new Map<string, IList> ([
        ['inventory', new Inventory (this)],
        ['equipment', new Equipment (this)],
        ['loot', new Loot (this)]
    ])

    state:EntityState = EntityState.Idle;

    get isAlive () : boolean
    {
        return this.health.current > 0;
    }

    constructor ()
    {
        this.health.initialize ();
        this.mana.initialize ();
    }
    

    onTurn (room:IRoomBattle) : void 
    {

    }
    

    action (room:IRoomBattle, action:ISkill, targetGroupIndex:number, targetIndex:number) : string
    {
        const indexes = room.getIndexesForEntity (this);

        if (action.targetType === TargetType.Self)
        {
            targetGroupIndex = indexes[0];
            targetIndex = indexes[1];
        }
        else 
            if (action.targetType === TargetType.Opponent && targetGroupIndex === indexes[0])
                return 'Target must be an opponent';
            else if (action.targetType === TargetType.Ally && targetGroupIndex !== indexes[0])
                return 'Target must be an ally';

        const currentLevel = action.getCurrentLevel ();
        const piece = room.getPiece (indexes[0], indexes[1])!;

        if (!currentLevel.isReady (this, piece.turnCount))
            return 'On cooldown';

        if (currentLevel.manaCost > this.mana.current)
            return 'Not enough mana';


        let targets = [room.board[targetGroupIndex][targetIndex]];

        if (action.isAoE)
            targets = targets.concat (room.board[targetGroupIndex].filter (bp => bp.entity !== targets[0].entity && bp.entity !== null));


        const effects = currentLevel.calculate (this, targets.map (t => t.entity!));

        room.broadcastToActivePlayers ('Action', this.id, action.id, targets[0].entity!.id, action.range, action.duration, JSON.stringify (effects));
        

        let durationToEnemy = (((Math.abs (targets[0].position[0] - piece.position[0]) - action.range) * 1.5) + action.duration) ;
        if (durationToEnemy < 0)
            durationToEnemy = 0;

        this.state = EntityState.Action;

        setTimeout (() => 
            {
                currentLevel.use ();

                setTimeout (() => { 
                    this.state = EntityState.Idle;
                    room.endTurn(); 
                }, durationToEnemy);
            }, durationToEnemy + action.duration);

        return '';
    }
   
}