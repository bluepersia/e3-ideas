import Entity, { EntityState, IEntity } from "./Entity";
import Enemy from "./Enemy";
import MapBase, { MapBattle, MapPVP, MapPvE } from "./Map";
import Player from "./Player";
import AssetLibrary from "./AssetLibrary";
import { ISkill, TargetType } from "./Skill";

const SCREEN_WIDTH = 900;


export interface IRoom 
{
    id:string;
    mapBase:MapBase;
    players:Player[];

    hasSpace: () => boolean;
    addPlayer: (player:Player) => void;
    broadcast: (msgId:string, ...values:string[]) => void;
    onPlayerJoined: (player:Player) => void;
    onPlayerLeft: (player:Player) => void;
    onMessage: (player:Player, msgId:string, ...args:any[]) => void;
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

    onPlayerJoined (player:Player) : void 
    {

    }

    onPlayerLeft (player:Player) : void 
    {
        this.broadcast ('PlayerLeft', player.character.id);
    }

    onMessage (player:Player, msgId:string, ...args:any[]) : void 
    {

    }
}

interface IBattlePiece 
{
    entity:Entity|null;
    position: [number, number];
    isActive:boolean;
    turnCount:number;
}

export class BattlePiece implements IBattlePiece
{
    entity:Entity|null;
    position: [number, number];
    isActive:boolean = false;
    turnCount: number = 0;
}

export interface IRoomBattle extends IRoomStrong<MapBattle>
{
    lobbyListeners: Player[];
    board:BattlePiece[][];
    waveIndex:number;
    isStarted:boolean;
    turnGroup:number;
    turn:[number, number];
    turnStamp:number;

    listenLobby: (player:Player) => void;
    stopListeningLobby: (player:Player) => void;
    getLobbyPlayers: () => Player[];
    broadcastToLobby: (msgId:string, includeListeners:boolean, ...args:any[]) => void;
    
    removeEntityFromBoard: (entity:Entity) => void;
    choosePosition: (player:Player, groupIndex:number, index:number) => void;
    isGameReady:  () => boolean;
    isPlayerReady: (player:Player) => boolean;
    start: (player:Player) => void;

    onEnteredMap: (player:Player) => void;
    spawnPlayer: (player:Player) => void;
    spawnGroupForPlayer: (player:Player, group:BattlePiece[]) => void;
    getSpawnData: (entity:Entity) => string[];
    nextTurn: () => void;
    skipTurn: () => void;
    startTurn: () => void;
    endTurn:() => void;

    getPiece: (groupIndex:number, index:number) => BattlePiece|null;
    getPieceByEntity: (entity:IEntity) => BattlePiece|null;
    getIndexesForEntity: (entity:Entity) => [number, number];
    countEntities: (groupIndex:number) => number;
    countEntitiesAlive: (groupIndex:number) => number;
    generatePositions: (groupIndex:number) => void;
    fillGroupAndGeneratePositions: (groupIndex:number) => void;
    generateBoard: () => void;
    spawnWave: () => void;
    nextWave: () => void;
    endGame: () => void;
    getActivePlayers: () => Player[];
    getCurrentTurnEntity: () => Entity;
    broadcastToActivePlayers: (msgId:string, ...args:any[]) => void;
    addListenersToEntity: (entity:IEntity) => void;
    removeListenersFromEntity: (entity:IEntity) => void;
}

export class RoomBattle extends Room<MapBattle> implements IRoomBattle
{
    lobbyListeners: Player[] = [];
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


    listenLobby (player:Player) : void 
    {
        //Start listening to lobby 
        this.lobbyListeners.push (player);

        //Spawns the list of players
        this.players.forEach (p => player.send ('SpawnLobbyPlayer', player.character.id, player.character.level));

        //Sends the board size for the first group (front-end then generates the visuals)
        player.send ('BoardSize', 0, this.board[0].length);

        //Sends any positions taken to the player and displays them on board. If a piece is active, it will show green status that player is in battle.
        this.board[0].forEach ((piece, index) => {
            if (piece.entity)
                player.send ('SetLobbyPosition', 0, index, piece.entity.id, piece.isActive);
        })

        
        if (this.map instanceof MapPVP)
        {
            //Do the same as with the first group with second, if it's a PvP map. 

            player.send ('BoardSize', 1, this.board[1].length);

            this.board[1].forEach ((piece, index) => {
                if (piece.entity)
                    player.send ('SetLobbyPosition', 1, index, piece.entity.id, piece.isActive);
            });
            
        }
    }

    stopListeningLobby(player: Player): void {
        this.lobbyListeners = this.lobbyListeners.filter (p => p === player);
    }

    getLobbyPlayers (includeListeners:boolean =false) : Player[]
    {
        //Only get players that have no position or are inactive/out of battel.
        let players = this.players.filter (p => {
            const piece = this.getPieceByEntity (p.character);
            return !piece || !piece.isActive;
        });
        
        //Include lobby listeners? then add them too 
        if (includeListeners)
            players = players.concat (this.lobbyListeners);

        return players;
    }

    broadcastToLobby (msgId:string, includeListeners:boolean, ...args:any[]) : void 
    {
        this.getLobbyPlayers (includeListeners).forEach (p => p.send (msgId, ...args));
    }

    override onPlayerJoined(player: Player): void {
        this.broadcastToLobby ('SpawnLobbyPlayer', true, player.character.id, player.character.level);

        this.getLobbyPlayers ().forEach (p => {
            if (p !== player)
                player.send ('SpawnLobbyPlayer', p.character.id, p.character.level);
        })
    }

    override onPlayerLeft(player: Player): void {


        if (this.getCurrentTurnEntity () === player.character)
            this.skipTurn ();
        
        
       this.removeEntityFromBoard (player.character);

        super.onPlayerLeft(player);
    }
  

    removeEntityFromBoard (entity:Entity) : void 
    {
        for (let i = 0; i < 2; i++)
            {
                const group = this.board[i];

                for (let j = 0; j < group.length; j++)
                {
                    const groupPiece = group[j];
                    if (groupPiece.entity === entity)
                    {
                        groupPiece.entity = null;
                        groupPiece.turnCount = 0;
                        this.broadcastToLobby ('RemoveLobbyPosition', true, i, j);
                        this.removeListenersFromEntity (entity);
                    }
                }
            }
    }

    choosePosition (player:Player, groupIndex:number, index:number) : void
    {
        const piece = this.getPiece (groupIndex, index);

        if (!piece)
            return;

        if  (!piece.entity)
            {
                this.removeEntityFromBoard (player.character);
                piece.entity = player.character;
            }
        else  if (piece.entity === player.character)
                piece.entity = null;
        else 
            return;

            //Synchronize front-end to show position in lobby
            if (piece.entity)
                this.broadcastToLobby ('SetLobbyPosition', true, groupIndex, index, piece.entity.id, false);
            else   
                this.broadcastToLobby ('RemoveLobbyPosition', true, groupIndex, index);
    }

    isGameReady () : boolean
    {
        return this.countEntities (0) >=  1 && this.countEntities(1) >= 1;
    }

    isPlayerReady (player: Player) : boolean
    {
        return this.getPieceByEntity (player.character) !== null;
    }

    start (player:Player) : void 
    {
        if (!this.isGameReady ())
            return;
        if (!this.isPlayerReady (player))
            return;
    
        player.send ('Start');
    }


    onEnteredMap (player:Player) : void
    {
        if (!this.isStarted)
        {
            if (!this.isGameReady ())
                return;

            if (!!this.isPlayerReady (player))
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

        this.broadcastToLobby ('SetLobbyActive', true, player.character.id);
        this.broadcast ('SpawnEntity', ...this.getSpawnData (player.character));

        this.addListenersToEntity (player.character);
    }
    spawnGroupForPlayer (player:Player, group:BattlePiece[]) : void 
    {
        group.forEach (piece => {
            if (piece.entity !== null && piece.entity !== player.character && piece.isActive)
                player.send ('SpawnEntity', ...this.getSpawnData (piece.entity))
        })
    }

    getSpawnData (entity:Entity) : any[] 
    {
        return [entity.id, entity.name, entity.level, this.getPieceByEntity (entity)!.position.join ('_')];
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

            const piece = group[nextIndex];
            if (piece.entity && piece.isActive)
            {
                this.turnGroup = groupIndex;
                this.turn[groupIndex] =nextIndex;
                this.startTurn ();
                return;
            }
            turnIndex = nextIndex;
        }

        
    }

    skipTurn () : void 
    {
        let turnIndex = this.turn[this.turnGroup];
        let groupIndex = this.turnGroup;
        let group = this.board[groupIndex];

        while (turnIndex < group.length)
        {
            const nextIndex = turnIndex + 1;
            if (nextIndex >= group.length)
            {
                groupIndex = groupIndex === 0 ? 1 : 0;
                group = this.board[groupIndex];
                turnIndex = -1;
                continue;
            }
            const piece = group[nextIndex];
            if (piece.entity && piece.isActive)
            {
                this.turnGroup = groupIndex;
                this.turn[groupIndex] = nextIndex;
                this.startTurn ();
            }
        }
    }

    startTurn () : void 
    {
        const entity = this.getCurrentTurnEntity ();
        entity.onTurn (this);
      
        const stamp = this.turnStamp = Date.now ();
        this.broadcast ('SetTurn', entity.id);
        
        setTimeout (() =>
        {
            if (this.turnStamp === stamp && entity.state === EntityState.Idle)
                this.nextTurn ();
        },30000);
    }


    endTurn () : void 
    {
        if (this.map instanceof MapPvE)
        {
            if (this.countEntitiesAlive (1) <= 0)
                {
                    this.nextWave ();
                    return;
                }
        }
        else 
        {
            if (this.countEntitiesAlive(0) <= 0 || this.countEntitiesAlive(1) <= 0)
                {
                    this.endGame ();
                    return;
                }
        }
        this.nextTurn ();
    }
  
    

    onMessage(player: Player, msgId: string, ...args: any[]): void {
        switch (msgId)
        {
            case "Start":
                this.start (player);
                break;

            case "EnteredMap":
                this.onEnteredMap (player);
            break;
            case "Action":
                const err = player.character.useSkill (this, args[0], Number (args[1]), Number (args[2]));

                if (err)
                    player.send ('ActionError', err);
                
                break;
        }
    }


    getIndexesForEntity (entity:IEntity) : [number, number] 
    {
        for (let i = 0; i < 2; i++)
        {
            const group = this.board[i];

            for(let j = 0; j < group.length; j++)
            {
                if (group[j].entity === entity)
                    return [i, j];
            }
        }
        return [-1, -1];
    }
    getPiece (groupIndex:number, index:number) : BattlePiece | null
    {
        if (this.board.length <= groupIndex)
            return null;

        if (this.board[groupIndex].length <= index)
            return null;

        return this.board[groupIndex][index];
    }

    getPieceByEntity (entity:IEntity) : BattlePiece | null
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


    countEntities (groupIndex):number 
    {
        return this.board[groupIndex].reduce ((prev, curr) => curr.entity === null ? prev : prev + 1, 0);
    }

    countEntitiesAlive (groupIndex: number) : number{
        return this.board[groupIndex].reduce ((prev, curr) => curr.entity?.isAlive ? prev + 1 : prev, 0);
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
                    this.addListenersToEntity (el.entity);
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
                {
                    const piece = this.board[0][i];
                    if (!piece.entity)
                        continue;
                    this.broadcastToActivePlayers ('SetPosition', piece.entity.id, piece.position.join('_'));
                }

            this.spawnWave ();
            setTimeout (this.nextTurn, 5000);

            return;
        }

        this.endGame ();
    }


    endGame () : void 
    {
        this.turn = [-1, -1];
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

    broadcastToActivePlayers (msgId:string, ...args:any[]) : void 
    {
        this.getActivePlayers ().forEach (p => p.send (msgId, ...args));
    }



   

    getCurrentTurnEntity () : Entity
    {
        return this.board[this.turnGroup][this.turn[this.turnGroup]].entity!;
    }

    addListenersToEntity (entity: IEntity) : void 
    {
        //Send health to client when it changes
        entity.health.onCurrentChangeEvent.push (() => this.broadcastToActivePlayers ('Health', entity.id, entity.health.current));
        entity.health.onMaxChangeEvent.push (() => this.broadcastToActivePlayers ('HealthMax', entity.id, entity.health.max));
    }

    removeListenersFromEntity (entity:IEntity) : void
    {
        entity.health.onMaxChangeEvent = [];
        entity.health.onCurrentChangeEvent = [];
    }


    
    
}






