import Asset from "./Asset";
import GameMap from "./Map";
import Player from "./Player";
import Room from "./Room";

export default class Matchmaker
 {
    private static rooms:Room[] = [];

    public static list(mapId:string) : Room[]
    {
        return this.rooms.filter (room => room.map.id === mapId && room.hasSpace());
    }

    public static create (player:Player, mapId:string) : string
    {
        const map = Asset.Load (mapId) as GameMap;

        if (!player.hasUnlockedMap (map))
            return 'Map has not been unlocked!';

        const newRoom = map.newRoom ();
        newRoom.addPlayer (player);

        return '';
    }

    public static join(player:Player, room:Room) : string 
    {
        if (!player.hasUnlockedMap (room.map))
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