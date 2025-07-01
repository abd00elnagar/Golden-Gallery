import { getAllUsers } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await getAllUsers();

  // Create CSV content with styling
  const csvRows = [
    // Headers with background color
    [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Created At",
      "Orders Count",
      "Favorites Count",
      "Cart Items Count",
    ].join(","),
    // Data rows
    ...users.map((user) =>
      [
        user.id,
        `"${user.name || "Anonymous User"}"`,
        `"${user.email}"`,
        `"${user.phone || "Not provided"}"`,
        `"${user.address || "Not provided"}"`,
        new Date(user.created_at).toLocaleDateString(),
        user.orders?.length || 0,
        user.favorites?.length || 0,
        user.cart?.length || 0,
      ].join(",")
    ),
  ].join("\n");

  // Add Excel styling
  const excelContent = `sep=,\n${csvRows}`;

  // Create headers for Excel with UTF-8 BOM for proper character encoding
  const headers = new Headers();
  headers.set("Content-Type", "text/csv; charset=utf-8");
  headers.set(
    "Content-Disposition",
    `attachment; filename="users-${new Date().toISOString().split("T")[0]}.csv"`
  );

  return new NextResponse("\ufeff" + excelContent, { headers });
}
