using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace appweb.Migrations
{
    /// <inheritdoc />
    public partial class AddComboTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cinema_id",
                table: "Showtimes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cinema_name",
                table: "Showtimes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "movie_title",
                table: "Showtimes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "room_name",
                table: "Showtimes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "combos",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    stock = table.Column<int>(type: "int", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_combos", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "combos");

            migrationBuilder.DropColumn(
                name: "cinema_id",
                table: "Showtimes");

            migrationBuilder.DropColumn(
                name: "cinema_name",
                table: "Showtimes");

            migrationBuilder.DropColumn(
                name: "movie_title",
                table: "Showtimes");

            migrationBuilder.DropColumn(
                name: "room_name",
                table: "Showtimes");
        }
    }
}
