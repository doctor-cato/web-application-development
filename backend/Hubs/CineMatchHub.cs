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
    }

    public class RoomInfo
    {
        public string RoomId { get; set; } = string.Empty;
        public MatchRequest User1 { get; set; } = null!;
        public MatchRequest User2 { get; set; } = null!;
        public bool User1Accepted { get; set; }
        public bool User2Accepted { get; set; }
    }

    [Authorize]
    public class CineMatchHub : Hub
    {

        private static ConcurrentBag<MatchRequest> _queue = new ConcurrentBag<MatchRequest>();
        private static ConcurrentDictionary<string, RoomInfo> _rooms = new ConcurrentDictionary<string, RoomInfo>();

        public async Task FindMatch(string userId, string userName, string genre)
        {
            var req = new MatchRequest
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                UserName = userName,
                Genre = genre
            };

            MatchRequest? partner = null;
            lock (_queue)
            {
                partner = _queue.FirstOrDefault(x =>
                    x.UserId != userId &&
                    (x.Genre == genre || genre == "all" || x.Genre == "all"));

                if (partner != null)
                {

                    var newList = _queue.Where(x => x.ConnectionId != partner.ConnectionId).ToList();
                    _queue = new ConcurrentBag<MatchRequest>(newList);
                }
                else
                {
                    _queue.Add(req);
                }
            }

            if (partner != null)
            {

                string roomId = Guid.NewGuid().ToString();
                var room = new RoomInfo
                {
                    RoomId = roomId,
                    User1 = partner,
                    User2 = req
                };

                _rooms.TryAdd(roomId, room);

                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMatchFound", new
                {
                    RoomId = roomId,
                    PartnerId = room.User2.UserId,
                    PartnerName = room.User2.UserName,
                    MatchPercent = new Random().Next(85, 100),
                    Connections = new Random().Next(5, 50),
                    Rating = Math.Round(new Random().NextDouble() * (5.0 - 4.0) + 4.0, 1)
                });

                await Clients.Client(room.User2.ConnectionId).SendAsync("OnMatchFound", new
                {
                    RoomId = roomId,
                    PartnerId = room.User1.UserId,
                    PartnerName = room.User1.UserName,
                    MatchPercent = new Random().Next(85, 100),
                    Connections = new Random().Next(5, 50),
                    Rating = Math.Round(new Random().NextDouble() * (5.0 - 4.0) + 4.0, 1)
                });
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

            lock (_queue)
            {
                var newList = _queue.Where(x => x.ConnectionId != Context.ConnectionId).ToList();
                _queue = new ConcurrentBag<MatchRequest>(newList);
            }

            var roomKV = _rooms.FirstOrDefault(r => r.Value.User1.ConnectionId == Context.ConnectionId || r.Value.User2.ConnectionId == Context.ConnectionId);
            if (roomKV.Value != null)
            {
                var room = roomKV.Value;
                var otherClient = room.User1.ConnectionId == Context.ConnectionId ? room.User2.ConnectionId : room.User1.ConnectionId;

                await Clients.Client(otherClient).SendAsync("OnPartnerDisconnected");
                _rooms.TryRemove(roomKV.Key, out _);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
