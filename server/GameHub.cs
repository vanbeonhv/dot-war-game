using DotWar.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DotWar;

public class GameHub : Hub
{
    private static readonly Dictionary<string, PlayerState> _players = new();
    private static bool _loopStarted = false;

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");

        // Khởi tạo player state mặc định
        var defaultState = new PlayerState
        {
            X = 100,
            Y = 100,
            Direction = 0,
            Name = $"Player_{Context.ConnectionId[..8]}",
            Color = "#ff0000",
            IsMain = false,
            Hp = 100,
            Score = 0,
            MoveDirX = 0,
            MoveDirY = 0
        };
        
        _players[Context.ConnectionId] = defaultState;

        if (!_loopStarted)
        {
            _loopStarted = true;
            await StartLoop();
        }

        await Clients.All.SendAsync("ReceiveMessage", "Hello World!");
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        _players.Remove(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    private async Task StartLoop()
    {
        while (true)
        {
            var snapshot = _players.Select(p => new
            {
                Id = p.Key,
                X = p.Value.X,
                Y = p.Value.Y,
                Direction = p.Value.Direction,
                Name = p.Value.Name,
                Color = p.Value.Color,
                IsMain = p.Value.IsMain,
                Hp = p.Value.Hp,
                Score = p.Value.Score,
                MoveDirX = p.Value.MoveDirX,
                MoveDirY = p.Value.MoveDirY
            }).ToList();
            await Clients.All.SendAsync("SyncState", snapshot);
            await Task.Delay(1000);
        }
    }

    public async Task Ping()
    {
        await Clients.Caller.SendAsync("Pong", "pong from server");
    }

    public Task UpdatePlayerState(PlayerState state)
    {
        try
        {
            _players[Context.ConnectionId] = state;
            Console.WriteLine($"Player {Context.ConnectionId} updated: X={state.X}, Y={state.Y}, HP={state.Hp}, Score={state.Score}");
            return Task.CompletedTask;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}