using DotWar.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DotWar;

public class GameHub : Hub
{
    private static readonly Dictionary<string, PlayerState> _players = new();

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        await Clients.All.SendAsync("ReceiveMessage", "Hello World!");
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
        return base.OnDisconnectedAsync(exception);
    }

    public async Task Ping()
    {
        await Clients.Caller.SendAsync("Pong", "pong from server");
    }

    public Task UpdatePlayerState(PlayerState state)
    {
        _players[Context.ConnectionId] = state;
        Console.WriteLine($"{state.X},{state.Y},{state.Direction}");
        return Task.CompletedTask;
    }
}