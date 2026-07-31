using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace appweb.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "backdrop_url",
                table: "movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cast",
                table: "movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "director",
                table: "movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gallery",
                table: "movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "movies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "cinematches",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Showtimes_StartTime",
                table: "Showtimes",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_cinematches_status",
                table: "cinematches",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_bookings_created_at",
                table: "bookings",
                column: "created_at");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Showtimes_StartTime",
                table: "Showtimes");

            migrationBuilder.DropIndex(
                name: "IX_cinematches_status",
                table: "cinematches");

            migrationBuilder.DropIndex(
                name: "IX_bookings_created_at",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "backdrop_url",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "cast",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "director",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "gallery",
                table: "movies");

            migrationBuilder.DropColumn(
                name: "language",
                table: "movies");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "cinematches",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
