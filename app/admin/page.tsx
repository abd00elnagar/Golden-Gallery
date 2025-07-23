import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Eye,
  BarChart3,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { getCategories, getOrders, getProducts } from "@/lib/actions";
import { getAllUsers } from "@/lib/auth";
import { Suspense } from "react";
import Loading from "./loading";

export const generateMetadata = () => ({ title: "Admin Dashboard" });

async function DashboardContent() {
  const [products, categories, orders, users] = await Promise.all([
    getProducts(),
    getCategories(),
    getOrders(),
    getAllUsers(),
  ]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const lowStockProducts = products.filter((p) => p.stock < 5);

  // Calculate monthly revenue and growth
  const now = new Date();
  const thisMonth = orders.filter(
    (order) => new Date(order.created_at).getMonth() === now.getMonth()
  );
  const lastMonth = orders.filter(
    (order) =>
      new Date(order.created_at).getMonth() === now.getMonth() - 1 ||
      (now.getMonth() === 0 && new Date(order.created_at).getMonth() === 11)
  );

  const monthlyRevenue = thisMonth.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const lastMonthRevenue = lastMonth.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const monthlyGrowth = lastMonthRevenue
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  // Calculate other growth metrics
  const lastMonthProducts = products.filter(
    (product) =>
      new Date(product.created_at).getMonth() === now.getMonth() - 1 ||
      (now.getMonth() === 0 && new Date(product.created_at).getMonth() === 11)
  ).length;
  const productGrowth = lastMonthProducts
    ? ((totalProducts - lastMonthProducts) / lastMonthProducts) * 100
    : 0;

  const lastMonthOrders = orders.filter(
    (order) =>
      new Date(order.created_at).getMonth() === now.getMonth() - 1 ||
      (now.getMonth() === 0 && new Date(order.created_at).getMonth() === 11)
  ).length;
  const orderGrowth = lastMonthOrders
    ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100
    : 0;

  const lastMonthUsers = users.filter(
    (user) =>
      new Date(user.created_at).getMonth() === now.getMonth() - 1 ||
      (now.getMonth() === 0 && new Date(user.created_at).getMonth() === 11)
  ).length;
  const userGrowth = lastMonthUsers
    ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100
    : 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      change: `${productGrowth > 0 ? "+" : ""}${productGrowth.toFixed(1)}%`,
      changeType:
        productGrowth >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Total Categories",
      value: totalCategories,
      icon: BarChart3,
      color: "text-purple-600",
      change: "Active",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      change: `${orderGrowth > 0 ? "+" : ""}${orderGrowth.toFixed(1)}%`,
      changeType:
        orderGrowth >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-indigo-600",
      change: `${userGrowth > 0 ? "+" : ""}${userGrowth.toFixed(1)}%`,
      changeType:
        userGrowth >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-600",
      change: `${monthlyGrowth > 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`,
      changeType:
        monthlyGrowth >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "text-red-600",
      change: lowStockProducts.length > 0 ? "Action needed" : "All good",
      changeType:
        lowStockProducts.length > 0
          ? ("negative" as const)
          : ("positive" as const),
    },
  ];

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/50`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-16 flex-col gap-2">
            <Link href="/admin/products">
              <Package className="h-5 w-5" />
              Manage Products
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-16 flex-col gap-2 bg-transparent"
          >
            <Link href="/admin/categories">
              <BarChart3 className="h-5 w-5" />
              Manage Categories
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-16 flex-col gap-2 bg-transparent"
          >
            <Link href="/admin/orders">
              <ShoppingCart className="h-5 w-5" />
              Manage Orders
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-16 flex-col gap-2 bg-transparent"
          >
            <Link href="/admin/users">
              <Users className="h-5 w-5" />
              Manage Users
            </Link>
          </Button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                            ? "secondary"
                            : order.status === "processing"
                            ? "outline"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Inventory Alerts
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/products">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Stock
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                        EGP {product.price}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="destructive" className="text-xs">
                          {product.stock} left
                        </Badge>
                        <div className="w-20">
                          <Progress
                            value={(product.stock / 10) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-600">
                      All products are well stocked!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No inventory alerts at this time.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
