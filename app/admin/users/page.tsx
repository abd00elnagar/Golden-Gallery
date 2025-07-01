import { Suspense } from "react";
import { Eye, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createServerClient } from "@/lib/supabase";
import UserDetails from "./UserDetails";
import UsersTableSkeleton from "./loading";
import SearchUsers from "./SearchUsers";

async function getUsers(query?: string) {
  const supabase = createServerClient();
  let userQuery = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply search filter if query exists
  if (query) {
    userQuery = userQuery.or(
      `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  const { data: users, error } = await userQuery;

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return users;
}

async function exportUsersAction() {
  "use server";

  const supabase = createServerClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return null;
  }

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

  return new Response("\ufeff" + excelContent, { headers });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const users = await getUsers(searchParams?.q);

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and activity
          </p>
        </div>
        <form action={exportUsersAction}>
          <Button type="submit">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </form>
      </div>

      {/* Search */}
      <Suspense
        fallback={
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="h-10 animate-pulse bg-muted rounded-md" />
            </CardContent>
          </Card>
        }
      >
        <SearchUsers />
      </Suspense>

      {/* Users Table */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Favorites</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={user.image || "/placeholder-user.jpg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.name || "Anonymous User"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "Not provided"}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{user.orders?.length || 0}</TableCell>
                      <TableCell>{user.favorites?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View user details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            <Suspense
                              fallback={
                                <div className="space-y-4">
                                  <div className="h-16 animate-pulse bg-muted rounded-lg" />
                                </div>
                              }
                            >
                              <UserDetails userId={user.id} />
                            </Suspense>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
