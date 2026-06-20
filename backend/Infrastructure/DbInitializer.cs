using appweb.Models;
using System.IO;

namespace appweb.Infrastructure
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Movies.Any())
            {
                var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "DataSeeding", "movies.json");

                if (File.Exists(jsonPath))
                {
                    var jsonString = File.ReadAllText(jsonPath);

                    // Sử dụng tường minh System.Text.Json để xử lý chuỗi string mượt mà
                    var movies = System.Text.Json.JsonSerializer.Deserialize<List<Movie>>(jsonString, new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (movies != null)
                    {
                        context.Movies.AddRange(movies);
                        context.SaveChanges();
                    }
                }
            }
        }
    }
}