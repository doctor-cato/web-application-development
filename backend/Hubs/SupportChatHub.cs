using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Collections.Concurrent;
using System.Linq;

namespace appweb.Hubs;

public class SupportChatHub : Hub
{
    
    
    private static readonly ConcurrentDictionary<string, string> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email) || email == "Unknown User")
        {
            email = $"Khách ({Context.ConnectionId[..Math.Min(6, Context.ConnectionId.Length)]})";
        }
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (role == "ADMIN" || (email != null && email.ToLower().Contains("admin")))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        else
        {
            OnlineUsers.TryAdd(Context.ConnectionId, email);
            
            await Clients.Group("Admins").SendAsync("UserConnected", Context.ConnectionId, email);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (OnlineUsers.TryRemove(Context.ConnectionId, out var email))
        {
            await Clients.Group("Admins").SendAsync("UserDisconnected", Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    
    public async Task SendMessageToAdmin(string message)
    {
        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
        {
            OnlineUsers.TryGetValue(Context.ConnectionId, out email);
            if (string.IsNullOrEmpty(email))
            {
                email = $"Khách ({Context.ConnectionId[..Math.Min(6, Context.ConnectionId.Length)]})";
            }
        }
        var timestamp = DateTime.Now.ToString("HH:mm");
        
        
        await Clients.Group("Admins").SendAsync("ReceiveMessageFromUser", Context.ConnectionId, email, message, timestamp);
    }

    
    public async Task SendMessageToUser(string connectionId, string message)
    {
        var adminEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "Admin";
        var timestamp = DateTime.Now.ToString("HH:mm");

        
        await Clients.Client(connectionId).SendAsync("ReceiveMessage", adminEmail, message, timestamp);
        
        
        await Clients.Caller.SendAsync("MessageSentEcho", connectionId, message, timestamp);
    }
}

