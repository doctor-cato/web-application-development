using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace appweb.Migrations
{
    /// <inheritdoc />
    public partial class AuthPhase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "access_failed_count",
                table: "users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_otp_request_time",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "lockout_end",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "points",
                table: "users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    jwt_id = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_used = table.Column<bool>(type: "bit", nullable: false),
                    is_revoked = table.Column<bool>(type: "bit", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    added_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "FK_refresh_tokens_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_phone_number",
                table: "users",
                column: "phone_number",
                unique: true,
                filter: "[phone_number] IS NOT NULL AND [phone_number] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropIndex(
                name: "IX_users_email",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_phone_number",
                table: "users");

            migrationBuilder.DropColumn(
                name: "access_failed_count",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_otp_request_time",
                table: "users");

            migrationBuilder.DropColumn(
                name: "lockout_end",
                table: "users");

            migrationBuilder.DropColumn(
                name: "points",
                table: "users");

            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
