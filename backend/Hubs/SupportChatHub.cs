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
    // A simple thread-safe dictionary to keep track of online users and their display names (emails)
    // Key: ConnectionId, Value: Email
    private static readonly ConcurrentDictionary<string, string> OnlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var email = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email) || email == "Unknown User")
        {
            email = $"Khách ({Context.ConnectionId[..Math.Min(6, Context.ConnectionId.Length)]})";
        }
        var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (role == "ADMIN")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        else
        {
            OnlineUsers.TryAdd(Context.ConnectionId, email);
            // Notify admins that a new user is online
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

    // Called by the user to send a message to all admins
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
        
        // Broadcast to all admins
        await Clients.Group("Admins").SendAsync("ReceiveMessageFromUser", Context.ConnectionId, email, message, timestamp);
    }

    // Called by an admin to reply to a specific user
    public async Task SendMessageToUser(string connectionId, string message)
    {
        var adminEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "Admin";
        var timestamp = DateTime.Now.ToString("HH:mm");

        // Send back to the specific connection ID
        await Clients.Client(connectionId).SendAsync("ReceiveMessage", adminEmail, message, timestamp);
        
        // Also echo back to the caller admin so their UI updates
        await Clients.Caller.SendAsync("MessageSentEcho", connectionId, message, timestamp);
    }
}

