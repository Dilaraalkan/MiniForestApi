using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniForestApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTreeType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TreeType",
                table: "focusSession",
                type: "longtext",
                nullable: false,
                collation: "utf8mb4_0900_ai_ci")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TreeType",
                table: "focusSession");
        }
    }
}
