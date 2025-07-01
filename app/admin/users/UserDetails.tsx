import { User, ShoppingBag, Heart, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createServerClient } from "@/lib/supabase";

async function getUserDetails(userId: string) {
  const supabase = createServerClient();

  // Get user details with orders
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*, orders(*)")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user details:", userError);
    return null;
  }

  return user;
}

export default async function UserDetails({ userId }: { userId: string }) {
  const user = await getUserDetails(userId);

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        User details not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
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
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{user.name || "Anonymous User"}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {user.phone || "No phone number provided"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {user.address || "No address provided"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Orders</h4>
            </div>
            <p className="mt-2 text-2xl font-bold">{user.orders?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Favorites</h4>
            </div>
            <p className="mt-2 text-2xl font-bold">{user.favorites?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Cart Items</h4>
            </div>
            <p className="mt-2 text-2xl font-bold">{user.cart?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-6">
          <h4 className="mb-4 text-lg font-medium">Recent Orders</h4>
          {user.orders && user.orders.length > 0 ? (
            <div className="space-y-4">
              {user.orders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </p>
                    <p
                      className={`text-sm ${
                        order.status === "completed"
                          ? "text-green-600"
                          : order.status === "cancelled"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
