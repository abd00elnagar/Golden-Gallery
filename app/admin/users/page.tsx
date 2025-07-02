import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllUsers } from "@/lib/auth";
import { exportUsersAction } from "./actions";
import UsersList from "./UsersList";
import { getOrder } from "@/lib/actions";
import { Order } from "@/lib/types";
export default async function AdminUsersPage() {
  const users = await getAllUsers();
  // For each user, fetch their orders (assuming user.orders is an array of order IDs)
  const usersWithOrders = await Promise.all(
    users.map(async (user) => {
      const orders =
        Array.isArray(user.orders) && user.orders.length > 0
          ? await Promise.all(user.orders.map((orderId: string) => getOrder(orderId)))
          : [];
      return {
        ...user,
        orders,
      };
    })
  );
  // console.log(usersWithOrders[3].orders)
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
      <UsersList users={usersWithOrders} />
    </div>
  );
}
