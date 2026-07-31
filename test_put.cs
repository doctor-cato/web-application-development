using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes("3HD2K-Cinema-SuperSecret-Key-2024-Must-Be-At-Least-32-Bytes!");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "AdminUser"),
                new Claim(ClaimTypes.Role, "ADMIN")
            }),
            Expires = DateTime.UtcNow.AddMinutes(30),
            Issuer = "3HD2KCinema",
            Audience = "3HD2KCinemaApp",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = handler.CreateToken(tokenDescriptor);
        var tokenString = handler.WriteToken(token);
        
        Console.WriteLine($"Token: {tokenString}");
        
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenString);
        
        // Let's get the Backrooms movie
        var getRes = await client.GetAsync("http://3hd2k-api.somee.com/api/movies");
        var json = await getRes.Content.ReadAsStringAsync();
        
        // Find the movie ID
        // Hardcoded Backrooms movie ID
        string id = "359f2b24-0439-447e-aaf5-6ff1a51ab465";
        
        // Attempt a PUT request
        string putJson = @"{""id"":""359f2b24-0439-447e-aaf5-6ff1a51ab465"",""title"":""Backrooms Updated"",""description"":""Desc"",""duration"":105,""releaseDate"":""2026-06-26T00:00:00Z"",""genre"":""Kinh dị"",""posterUrl"":""link"",""backdropUrl"":"""",""trailerUrl"":"""",""ageRating"":""T16"",""status"":""now-showing"",""director"":"""",""language"":"""",""cast"":""[]"",""gallery"":""[]""}";
        
        var content = new StringContent(putJson, Encoding.UTF8, "application/json");
        var putRes = await client.PutAsync($"http://3hd2k-api.somee.com/api/movies/{id}", content);
        
        Console.WriteLine($"PUT Status: {putRes.StatusCode}");
        Console.WriteLine(await putRes.Content.ReadAsStringAsync());
    }
}
