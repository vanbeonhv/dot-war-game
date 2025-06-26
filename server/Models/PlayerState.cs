namespace DotWar.Models;

public class PlayerState
{
    public float X { get; set; }
    public float Y { get; set; }
    public float Direction { get; set; }
    public string Name { get; set; } = "";
    public string Color { get; set; } = "#ff0000";
    public bool IsMain { get; set; } = false;
    public int Hp { get; set; } = 100;
    public int Score { get; set; } = 0;
    public float MoveDirX { get; set; } = 0;
    public float MoveDirY { get; set; } = 0;
}