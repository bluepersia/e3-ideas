import Entity, { EntityState } from "./Entity";
import Enemy from "./Enemy";
import MapBase, { MapBattle, MapPvE } from "./Map";
import Player from "./Player";
import AssetLibrary from "./AssetLibrary";

const SCREEN_WIDTH = 900;


export interface IRoom 
{
    id:string;
    mapBase:MapBase;
    players:Player[];

    hasSpace: () => boolean;
    addPlayer: (player:Player) => void;
    broadcast: (msgId:string, ...values:string[]) => void;
}

export interface IRoomStrong<TMap extends MapBase> extends IRoom
{
    map:TMap;
}

export default class Room<TMap extends MapBase> implements IRoomStrong<TMap>
{
    id:string;
    mapBase:MapBase;
    map: TMap;
    players:Player[] = [];

    constructor (map:TMap)
    {
        this.id = Math.random().toString(16).slice(2);
        this.map = map;
        this.mapBase = map;
    }

    hasSpace () : boolean
    {
        return this.players.length < this.map.getSpace ();
    }

    addPlayer (player:Player) : void 
    {
        this.players.push (player);
    }

    broadcast (msgId:string, ...values:string[]) : void 
    {
        this.players.forEach (p => p.send (msgId, ...values));
    }
}

interface IBattlePiece 
{
    entity:Entity|null;
    position: [number, number];
    isActive:boolean;
}

export class BattlePiece implements IBattlePiece
{
    entity:Entity|null;
    position: [number, number];
    isActive:boolean = false;
}

export interface IRoomBattle extends IRoomStrong<MapBattle>
{
    board:BattlePiece[][];
    waveIndex:number;
    isStarted:boolean;
    turnGroup:number;
    turn:[number, number];

    getPiece: (groupIndex:number, index:number) => BattlePiece|null;
    getPieceByEntity: (entity:Entity) => BattlePiece|null;
    countEntities: (groupIndex:number) => number;
    isGameReady:  () => boolean;
    choosePosition: (player:Player, groupIndex:number, index:number) => void;
    generatePositions: (group:BattlePiece[], count:number, groupIndex:number) => void;
    generateBoard: () => void;
    spawnWave: () => void;
    nextWave: () => void;
    onEnteredMap: (player:Player) => void;
    spawnPlayer: (player:Player) => void;
    spawnGroupForPlayer: (player:Player, group:BattlePiece[]) => void;
    getSpawnData: (entity:Entity) => string[];
    getActivePlayers: () => Player[];
    nextTurn: () => void;
    getCurrentTurnEntity: () => Entity;
    startTurn: () => void;

}

export class RoomBattle extends Room<MapBattle> implements IRoomBattle
{
    board:BattlePiece[][] = [[], []];
    waveIndex = 0;
    isStarted:boolean = false;
    turnGroup:number = 0;
    turn:[number, number] = [-1, -1];

    constructor (map:MapBattle) 
    {
        super (map);

        this.generateBoard ();
    }


    getPiece (groupIndex:number, index:number) : BattlePiece | null
    {
        if (this.board.length <= groupIndex)
            return null;

        if (this.board[groupIndex].length <= index)
            return null;

        return this.board[groupIndex][index];
    }

    getPieceByEntity (entity:Entity) : BattlePiece | null
    {
        this.board[0].forEach (piece => {
            if (piece.entity === entity)
                return entity;
        });
        this.board[1].forEach (piece => {
            if (piece.entity === entity)
                return entity;
        });
        return null;
    }

    countEntities (groupdIndex):number 
    {
        return this.board[groupdIndex].reduce ((prev, curr) => curr.entity === null ? prev : prev + 1, 0);
    }

    isGameReady () : boolean
    {
        return this.countEntities (0) >=  1 && this.countEntities(1) >= 1;
    }
    
    
    choosePosition (player:Player, groupIndex:number, index:number) : void
    {
        const piece = this.getPiece (groupIndex, index);

        if (!piece)
            return;

        if  (!piece.entity)
            piece.entity = player.character;
        else  if (piece.entity === player.character)
                piece.entity = null;
        else 
            return;

            //Synchronize front-end to show position in lobby
    }


    generatePositions (group:BattlePiece[], count:number, groupIndex:number=0) : void
    {
        group.fill (new BattlePiece (), 0, count);

        if (group.length === 4)
            {
                group[0].position = [100, 400];
                group[1].position = [400, 400];
                group[2].position = [100, 100];
                group[3].position = [400, 100];
            }
            else if (group.length === 3)
            {
                group[0].position = [100, 400];
                group[1].position = [400, 250];
                group[2].position = [100, 100];
            }

        if (groupIndex === 1)
            group.forEach (piece => { piece.position = [(SCREEN_WIDTH - piece.position[0]), piece.position[1]]; });

        group.forEach (piece => { 
            piece.position [0] += (this.waveIndex * SCREEN_WIDTH);
        })
    }

    generateBoard () : void 
    {
        this.board = [[], []];

        for (let i = 0; i < 2; i++)
        {
            const group = this.board[i];
            this.generatePositions (group, this.map.getSizeAt (i, 0), i);
        }

        this.spawnWave ();
    }


    spawnWave () : void 
    {
        //If map is PvE we get enemies and place them
        if (this.map instanceof MapPvE)
            {
                const enemies = this.map.newWaveIds (this.waveIndex).map (id => new Enemy (AssetLibrary.getEnemyById(id)!));
    
                this.board [1].forEach ((el, index) => { 
                    el.entity = enemies[index]; 
                    el.entity.id = this.waveIndex+ '-' + index;
                    el.isActive = true;
                });

                this.getActivePlayers ().forEach (p =>this.spawnGroupForPlayer (p, this.board[1]));
            }
    }


    nextWave () : void 
    {
        if (this.map instanceof MapPvE)
        {
            this.waveIndex++;

            if(this.waveIndex >= this.map.waves.length)
                this.endGame ();

            this.board[1] = [];
            this.generatePositions (this.board[1], this.map.waves[this.waveIndex].length, 1);
            this.spawnWave ();

            return;
        }

        this.endGame ();
    }


    endGame () : void 
    {
    
    }



    onEnteredMap (player:Player) : void
    {
        if (!this.isStarted)
        {
            if (!this.isGameReady ())
                return;


            this.isStarted = true;
            this.spawnPlayer (player);
            this.nextTurn ();
            return;
        }

        this.spawnPlayer (player);
    }

    spawnPlayer (player:Player) : void 
    {
        this.spawnGroupForPlayer (player, this.board[0]);
        this.spawnGroupForPlayer (player, this.board[1]);

        this.getPieceByEntity (player.character)!.isActive = true;
        this.broadcast ('SpawnEntity', ...this.getSpawnData (player.character));
    }
    spawnGroupForPlayer (player:Player, group:BattlePiece[]) : void 
    {
        group.forEach (piece => {
            if (piece.entity !== null && piece.entity != player.character && piece.isActive)
                player.send ('SpawnEntity', ...this.getSpawnData (piece.entity))
        })
    }

    getSpawnData (entity:Entity) : string[] 
    {
        return [entity.id, entity.name, entity.level.toString (), this.getPieceByEntity (entity)!.position.join ('_')];
    }


    getActivePlayers () : Player[]
    {   
        return this.players.filter (p => {
            const piece = this.getPieceByEntity (p.character);
            if (piece && piece.isActive)
                return true;

            return false;
        })
    }


    nextTurn () : void 
    {
        const curr = this.turn[this.turnGroup];
        const group = this.board[this.turnGroup];

        for (let i = curr + 1; i < group.length; i++)
        {
            if (group[i].entity)
            {
                this.turn[this.turnGroup] = i;
                this.startTurn ();
                return;
            }

            if (i >= this.board[this.turnGroup].length - 1)
            {
                this.turnGroup = this.turnGroup === 0 ? 1 : 0;
                this.turn[this.turnGroup] = -1;
                this.nextTurn ();
                return;
            }
        }
    }

    getCurrentTurnEntity () : Entity
    {
        return this.board[this.turnGroup][this.turn[this.turnGroup]].entity!;
    }

    startTurn () : void 
    {
        this.broadcast ('SetTurn', this.getCurrentTurnEntity ().id);
        
        setTimeout (() =>
        {
            if (this.getCurrentTurnEntity ().state === EntityState.Idle)
                this.nextTurn ();
        },30000);
    }

    
}






