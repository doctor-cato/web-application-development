namespace appweb.DTOs.Movie
{
    public class MovieResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string? TrailerUrl { get; set; }
    }
}