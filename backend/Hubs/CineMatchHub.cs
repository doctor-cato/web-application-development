using Microsoft.AspNetCore.SignalR;
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

    public class CineMatchHub : Hub
    {
        // Thread-safe collections for storing queue and active rooms
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

            // Tìm đối tác trong queue (khác user id, cùng genre hoặc 1 trong 2 để 'all')
            // Chú ý: ConcurrentBag không hỗ trợ xóa trực tiếp dễ dàng, ta sẽ dùng lock hoặc cấu trúc khác
            // Để đơn giản, ta dùng lock tĩnh trên _queueList (do ConcurrentBag không có Remove)
            
            MatchRequest? partner = null;
            lock (_queue)
            {
                partner = _queue.FirstOrDefault(x => 
                    x.UserId != userId && 
                    (x.Genre == genre || genre == "all" || x.Genre == "all"));
                
                if (partner != null)
                {
                    // Lọc queue để bỏ partner ra (mô phỏng queue)
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
                // Found a match!
                string roomId = Guid.NewGuid().ToString();
                var room = new RoomInfo
                {
                    RoomId = roomId,
                    User1 = partner, // Người chờ trước
                    User2 = req      // Người vừa vào
                };
                
                _rooms.TryAdd(roomId, room);

                // Gửi thông tin về cho 2 bên
                // User 1 sẽ thấy thông tin của User 2
                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMatchFound", new
                {
                    RoomId = roomId,
                    PartnerId = room.User2.UserId,
                    PartnerName = room.User2.UserName,
                    MatchPercent = new Random().Next(85, 100),
                    Connections = new Random().Next(5, 50),
                    Rating = Math.Round(new Random().NextDouble() * (5.0 - 4.0) + 4.0, 1)
                });

                // User 2 sẽ thấy thông tin của User 1
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
                
                // Báo cho cả 2 trong phòng
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
                // Nếu 1 bên đồng ý bộ phim được đề xuất, tiến hành chốt và điều hướng
                await Clients.Client(room.User1.ConnectionId).SendAsync("OnMovieAgreed", movieId);
                await Clients.Client(room.User2.ConnectionId).SendAsync("OnMovieAgreed", movieId);
                
                // Dọn dẹp phòng (Xóa khỏi memory sau khi đồng ý)
                _rooms.TryRemove(roomId, out _);
            }
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Nếu disconnect khi đang ở queue
            lock (_queue)
            {
                var newList = _queue.Where(x => x.ConnectionId != Context.ConnectionId).ToList();
                _queue = new ConcurrentBag<MatchRequest>(newList);
            }

            // Nếu disconnect khi đang ở phòng
            var roomKV = _rooms.FirstOrDefault(r => r.Value.User1.ConnectionId == Context.ConnectionId || r.Value.User2.ConnectionId == Context.ConnectionId);
            if (roomKV.Value != null)
            {
                var room = roomKV.Value;
                var otherClient = room.User1.ConnectionId == Context.ConnectionId ? room.User2.ConnectionId : room.User1.ConnectionId;
                
                Clients.Client(otherClient).SendAsync("OnPartnerDisconnected").Wait();
                _rooms.TryRemove(roomKV.Key, out _);
            }

            return base.OnDisconnectedAsync(exception);
        }
    }
}
