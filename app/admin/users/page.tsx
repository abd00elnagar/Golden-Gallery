"use client"

import { useState } from "react"
import { Eye, Search, Download, User, ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { mockUser, mockOrders } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

// Mock additional users for demonstration
const mockUsers = [
  mockUser,
  {
    id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    image: "/placeholder.svg?height=100&width=100",
    favorites: ["2", "3"],
    cart: [],
    orders: [],
    created_at: "2024-01-15",
  },
  {
    id: "3",
    email: "bob.johnson@example.com",
    name: "Bob Johnson",
    image: "/placeholder.svg?height=100&width=100",
    favorites: ["1"],
    cart: [],
    orders: [],
    created_at: "2024-02-01",
  },
]

export default function AdminUsersPage() {
  const [users] = useState(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExportCSV = () => {
    toast({
      title: "Export started",
      description: "User data is being exported to CSV format.",
    })
  }

  const getUserOrders = (userId: string) => {
    return mockOrders.filter((order) => order.user_id === userId)
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage customer accounts and activity</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Favorites</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userOrders = getUserOrders(user.id)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{userOrders.length}</TableCell>
                      <TableCell>{user.favorites.length}</TableCell>
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
                            <div className="space-y-6">
                              {/* User Profile */}
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback className="text-lg">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{user.name}</h3>
                                  <p className="text-muted-foreground">{user.email}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Member since {new Date(user.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Statistics */}
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <ShoppingBag className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold">{userOrders.length}</p>
                                    <p className="text-sm text-muted-foreground">Orders</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Heart className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold">{user.favorites.length}</p>
                                    <p className="text-sm text-muted-foreground">Favorites</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <User className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold">{user.cart.length}</p>
                                    <p className="text-sm text-muted-foreground">Cart Items</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Order History */}
                              <div>
                                <h3 className="font-semibold mb-3">Order History</h3>
                                {userOrders.length > 0 ? (
                                  <div className="space-y-3">
                                    {userOrders.map((order) => (
                                      <div
                                        key={order.id}
                                        className="flex justify-between items-center p-3 border rounded-lg"
                                      >
                                        <div>
                                          <p className="font-medium">{order.order_number}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                                          <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-center py-4">No orders yet</p>
                                )}
                              </div>

                              {/* Favorites */}
                              <div>
                                <h3 className="font-semibold mb-3">Favorite Products</h3>
                                {user.favorites.length > 0 ? (
                                  <div className="text-sm text-muted-foreground">
                                    {user.favorites.length} products in favorites
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-center py-4">No favorites yet</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
