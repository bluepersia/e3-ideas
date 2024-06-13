import AssetLibrary from "./AssetLibrary";
import Player from "./Player";
import {IRoom} from "./Room";

export default class Matchmaker
 {
    private static rooms:IRoom[] = [];

    public static getRoomById (id:string) : IRoom | null
    {
        return this.rooms.find (r => r.id === id) || null;
    }

    public static list(mapId:string) : IRoom[]
    {
        return this.rooms.filter (room => room.mapBase.id === mapId && room.hasSpace());
    }

    public static create (player:Player, mapId:string) : string
    {
        const map = AssetLibrary.getMapById (mapId);

        if (!map)
            return 'Map does not exist';

        if (!player.hasUnlockedMap (map))
            return 'Map has not been unlocked!';

        const newRoom = map.newRoom ();
        newRoom.addPlayer (player);

        return '';
    }

    public static join(player:Player, room:IRoom) : string 
    {
        if (!player.hasUnlockedMap (room.mapBase))
            return 'Map has not been unlocked!';

        if (!room.hasSpace ())
            return 'Room is full!';

        room.addPlayer (player);

        return '';
    }
    public static joinById(player:Player, roomId:string) : string 
    {
        const room = this.rooms.find (r => r.id === roomId);

        if (!room)
            return 'Room does not exist';
        
        return this.join (player, room);
    }

    public static createJoin (player:Player, mapId:string) : string 
    {
        const rooms = this.list (mapId);

        if (rooms.length === 0)
            return this.create (player, mapId);

        return this.join (player, rooms[0]);
    }
 }