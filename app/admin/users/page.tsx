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
import { getAllUsers } from "@/lib/auth";
import { exportUsersAction } from "./actions";

async function getFilteredUsers(query?: string) {
  const users = await getAllUsers();

  if (!query) return users;

  const searchTerm = query.toLowerCase();
  return users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const users = await getFilteredUsers(searchParams?.q);

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
