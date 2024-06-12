export default class Asset
{
    id:string;

    public static Load (id:string) : Asset
    {
        return new Asset ();
    }
}