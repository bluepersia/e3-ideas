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
    turnStamp:number;

    getPiece: (groupIndex:number, index:number) => BattlePiece|null;
    getPieceByEntity: (entity:Entity) => BattlePiece|null;
    countEntities: (groupIndex:number) => number;
    isGameReady:  () => boolean;
    choosePosition: (player:Player, groupIndex:number, index:number) => void;
    generatePositions: (groupIndex:number) => void;
    fillGroupAndGeneratePositions: (groupIndex:number) => void;
    generateBoard: () => void;
    spawnWave: () => void;
    nextWave: () => void;
    endGame: () => void;
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
    turnStamp: number = Date.now ();

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


    fillGroupAndGeneratePositions (groupIndex:number=0) : void
    {
        const group:BattlePiece[] = this.board[groupIndex] = new BattlePiece[this.map.getSizeAt (groupIndex, this.waveIndex)];
        group.fill (new BattlePiece (), 0, group.length);

        this.generatePositions (groupIndex);
    }

    generatePositions (groupIndex:number) : void 
    {
        const group = this.board[groupIndex];
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
        for (let i = 0; i < 2; i++)
            this.fillGroupAndGeneratePositions (i);
        

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
            {
                this.endGame ();
                return
            }

            this.fillGroupAndGeneratePositions (1);
            this.generatePositions (0);
            for (let i = 0; i < this.board[0].length; i++)
                this.getActivePlayers ().forEach (p => p.send ('SetPosition', this.board[0][i].position.join('_')));

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

            if (this.getPieceByEntity (player.character) === null)
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
            if (piece.entity !== null && piece.entity !== player.character && piece.isActive)
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
        const groupIndex = this.turnGroup === 1 ? 0 : 1;
        const group =this.board[groupIndex];
        let turnIndex =this.turn[groupIndex];

        while (turnIndex < group.length)
        {
            let nextIndex = turnIndex + 1;
            if (nextIndex >= group.length)
                nextIndex = 0;

            if (group[nextIndex].entity)
            {
                this.turnGroup = groupIndex;
                this.turn[groupIndex] =nextIndex;
                this.startTurn ();
                return;
            }
            turnIndex = nextIndex;
        }

        
    }

    getCurrentTurnEntity () : Entity
    {
        return this.board[this.turnGroup][this.turn[this.turnGroup]].entity!;
    }

    startTurn () : void 
    {
        const stamp = this.turnStamp = Date.now ();
        this.broadcast ('SetTurn', this.getCurrentTurnEntity ().id);
        
        setTimeout (() =>
        {
            if (this.turnStamp === stamp && this.getCurrentTurnEntity ().state === EntityState.Idle)
                this.nextTurn ();
        },30000);
    }

    
}






