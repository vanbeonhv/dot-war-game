using DotWar;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(p =>
        p.WithOrigins("http://localhost:5173") // 👈 React app origin
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddSignalR();

var app = builder.Build();
app.UseCors();

app.MapGet("/", () => "Hello World!");
app.MapHub<GameHub>("/gamehub");

app.Run();
