using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniForestApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToFocusSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "focusSession",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "focusSession");
        }
    }
}
