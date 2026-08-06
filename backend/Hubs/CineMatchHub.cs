using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace appweb.Hubs
{
    public class MatchRequest
    {
        public string ConnectionId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public DateTime? DisconnectedAt { get; set; }
    }

    public class RoomInfo
    {
        public string RoomId { get; set; } = string.Empty;
        public MatchRequest User1 { get; set; } = null!;
        public MatchRequest User2 { get; set; } = null!;
        public bool User1Accepted { get; set; }
        public bool User2Accepted { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    [Authorize]
    public class CineMatchHub : Hub
    {
        private static ConcurrentDictionary<string, MatchRequest> _activeUsers = new ConcurrentDictionary<string, MatchRequest>();
        private static ConcurrentDictionary<string, RoomInfo> _rooms = new ConcurrentDictionary<string, RoomInfo>();

        public async Task FindMatch(string userId, string userName, string genre)
        {
            // 1. Cleanup old ghosts (disconnected > 15s)
            var ghosts = _activeUsers.Where(x => x.Value.DisconnectedAt.HasValue && (DateTime.UtcNow - x.Value.DisconnectedAt.Value).TotalSeconds > 120).Select(x => x.Key).ToList();
            foreach (var ghost in ghosts) _activeUsers.TryRemove(ghost, out _);

            // 2. Cleanup old rooms where someone didn't accept for > 30s
            var staleRooms = _rooms.Where(x => (!x.Value.User1Accepted || !x.Value.User2Accepted) && (DateTime.UtcNow - x.Value.CreatedAt).TotalSeconds > 120).Select(x => x.Key).ToList();
            foreach (var r in staleRooms) _rooms.TryRemove(r, out _);

            // 3. Check if user is already in a room
            var existingRoomKV = _rooms.FirstOrDefault(r => r.Value.User1.UserId == userId || r.Value.User2.UserId == userId);
            if (existingRoomKV.Value != null)
            {
                var existingRoom = existingRoomKV.Value;
                if (existingRoom.User1.UserId == userId)
                {
                    existingRoom.User1.ConnectionId = Context.ConnectionId;
                    existingRoom.User1.DisconnectedAt = null;
                }
                else
                {
                    existingRoom.User2.ConnectionId = Context.ConnectionId;
                    existingRoom.User2.DisconnectedAt = null;
                }

                var roomPartner = existingRoom.User1.UserId == userId ? existingRoom.User2 : existingRoom.User1;

                await Clients.Client(Context.ConnectionId).SendAsync("OnMatchFound", new
                {
                    RoomId = existingRoom.RoomId,
                    PartnerId = roomPartner.UserId,
                    PartnerName = roomPartner.UserName,
                    MatchPercent = new Random().Next(85, 100),
                    Connections = new Random().Next(5, 50),
                    Rating = Math.Round(new Random().NextDouble() * (5.0 - 4.0) + 4.0, 1)
                });
                return;
            }

            // 4. Update or add to active users
            var req = new MatchRequest
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                UserName = userName,
                Genre = genre,
                DisconnectedAt = null
            };
            
            _activeUsers.AddOrUpdate(userId, req, (k, v) => req);

            // 5. Find a partner
            MatchRequest? partner = null;
            var availablePartners = _activeUsers.Values.Where(x => x.UserId != userId && !x.DisconnectedAt.HasValue).ToList();
            
            partner = availablePartners.FirstOrDefault(x => x.Genre == genre || genre == "all" || x.Genre == "all");

            if (partner != null)
            {
                // Remove both from active searching queue
                _activeUsers.TryRemove(userId, out _);
                _activeUsers.TryRemove(partner.UserId, out _);

                string roomId = Guid.NewGuid().ToString();
                var room = new RoomInfo
                {
                    RoomId = roomId,
                    User1 = partner,
                    User2 = req,
                    CreatedAt = DateTime.UtcNow
                };

                _rooms.TryAdd(roomId, room);

                // Auto-accept server-side
                room.User1Accepted = true;
                room.User2Accepted = true;

                var rng = new Random();
                // Gop OnMatchFound + OnBothAccepted thanh 1 event "OnMatchReady"
                // Giam 4 await SendAsync -> 2 await, giam RTT va do tre
                var matchPayloadUser1 = new
                {
                    RoomId = roomId,
                    PartnerId = room.User2.UserId,
                    PartnerName = room.User2.UserName,
                    MatchPercent = rng.Next(85, 100),
                    Connections = rng.Next(5, 50),
                    Rating = Math.Round(rng.NextDouble() * (5.0 - 4.0) + 4.0, 1)
                };
                var matchPayloadUser2 = new
                {
                    RoomId = roomId,
                    PartnerId = room.User1.UserId,
                    PartnerName = room.User1.UserName,
                    MatchPercent = rng.Next(85, 100),
                    Connections = rng.Next(5, 50),
                    Rating = Math.Round(rng.NextDouble() * (5.0 - 4.0) + 4.0, 1)
                };

                // Gui song song de giam tong thoi gian cho
                await Task.WhenAll(
                    Clients.Client(room.User1.ConnectionId).SendAsync("OnMatchReady", matchPayloadUser1),
                    Clients.Client(room.User2.ConnectionId).SendAsync("OnMatchReady", matchPayloadUser2)
                );
            }
        }

        public async Task RejoinRoom(string roomId, string userId)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                if (room.User1.UserId == userId)
                {
                    room.User1.ConnectionId = Context.ConnectionId;
                    room.User1.DisconnectedAt = null;
                }
                else if (room.User2.UserId == userId)
                {
                    room.User2.ConnectionId = Context.ConnectionId;
                    room.User2.DisconnectedAt = null;
                }
            }
        }

        public async Task AcceptMatch(string roomId)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                if (room.User1.ConnectionId == Context.ConnectionId) room.User1Accepted = true;
                if (room.User2.ConnectionId == Context.ConnectionId) room.User2Accepted = true;

                if (room.User1Accepted && room.User2Accepted)
                {
                    await Clients.Client(room.User1.ConnectionId).SendAsync("OnBothAccepted");
                    await Clients.Client(room.User2.ConnectionId).SendAsync("OnBothAccepted");
                }
            }
        }

        public async Task SuggestMovie(string roomId, string movieId, string movieTitle)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                var sender = room.User1.ConnectionId == Context.ConnectionId ? room.User1 : room.User2;
                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMovieSuggested", sender.UserId, movieId, movieTitle);
                await Clients.Client(room.User2.ConnectionId).SendAsync("OnMovieSuggested", sender.UserId, movieId, movieTitle);
            }
        }

        public async Task SendMessage(string roomId, string message)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                var sender = room.User1.ConnectionId == Context.ConnectionId ? room.User1 : room.User2;
                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMessageReceived", sender.UserId, sender.UserName, message);
                await Clients.Client(room.User2.ConnectionId).SendAsync("OnMessageReceived", sender.UserId, sender.UserName, message);
            }
        }

        public async Task AgreeMovie(string roomId, string movieId)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMovieAgreed", movieId);
                await Clients.Client(room.User2.ConnectionId).SendAsync("OnMovieAgreed", movieId);
                _rooms.TryRemove(roomId, out _);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userInQueue = _activeUsers.Values.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (userInQueue != null)
            {
                userInQueue.DisconnectedAt = DateTime.UtcNow;
            }

            var roomKV = _rooms.FirstOrDefault(r => r.Value.User1.ConnectionId == Context.ConnectionId || r.Value.User2.ConnectionId == Context.ConnectionId);
            if (roomKV.Value != null)
            {
                var room = roomKV.Value;
                string partnerConnectionId;
                if (room.User1.ConnectionId == Context.ConnectionId)
                {
                    room.User1.DisconnectedAt = DateTime.UtcNow;
                    partnerConnectionId = room.User2.ConnectionId;
                }
                else
                {
                    room.User2.DisconnectedAt = DateTime.UtcNow;
                    partnerConnectionId = room.User1.ConnectionId;
                }

                try
                {
                    await Clients.Client(partnerConnectionId).SendAsync("OnPartnerDisconnected");
                }
                catch { /* Partner may also be disconnected */ }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
