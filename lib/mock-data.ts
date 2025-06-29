import type { Product, Category, User, Order } from "./types";

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Paintings",
    description: "Beautiful paintings and artwork",
  },
  { id: "2", name: "Sculptures", description: "Handcrafted sculptures" },
  {
    id: "3",
    name: "Photography",
    description: "Professional photography prints",
  },
  { id: "4", name: "Digital Art", description: "Modern digital artwork" },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Abstract Sunset",
    description:
      "A beautiful abstract painting capturing the essence of a sunset",
    price: 299.99,
    stock: 5,
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&variant=2",
    ],
    category_id: "1",
    likes: 24,
    ordered: 12,
    colors: [
      {
        id: "1",
        product_id: "1",
        name: "Original",
        hex: "#FF6B35",
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: "2",
        product_id: "1",
        name: "Blue Variant",
        hex: "#4A90E2",
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-15",
  },
  {
    id: "2",
    name: "Modern Sculpture",
    description: "Contemporary metal sculpture perfect for modern spaces",
    price: 599.99,
    stock: 3,
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&variant=3",
    ],
    category_id: "2",
    likes: 18,
    ordered: 8,
    colors: [
      {
        id: "3",
        product_id: "2",
        name: "Silver",
        hex: "#C0C0C0",
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: "4",
        product_id: "2",
        name: "Bronze",
        hex: "#CD7F32",
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-10",
  },
  {
    id: "3",
    name: "Nature Photography",
    description: "Stunning landscape photography print",
    price: 149.99,
    stock: 10,
    images: [
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400&variant=4",
    ],
    category_id: "3",
    likes: 32,
    ordered: 25,
    colors: [
      {
        id: "5",
        product_id: "3",
        name: "Standard",
        hex: "#228B22",
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-20",
  },
];

export const mockUser: User = {
  id: "1",
  email: "user@example.com",
  name: "John Doe",
  image: "/placeholder.svg?height=100&width=100",
  favorites: ["1", "3"],
  cart: [
    {
      product_id: "1",
      product_name: "Abstract Sunset",
      color_id: "1",
      color_name: "Original",
      quantity: 1,
      price: 299.99,
      image: "/placeholder.svg?height=400&width=400",
    },
  ],
  orders: ["1", "2"],
  created_at: "2024-01-01",
};

export const mockOrders: Order[] = [
  {
    id: "1",
    user_id: "1",
    order_number: "GG-2024-001",
    status: "delivered",
    payment_method: "Credit Card",
    shipping_address: "123 Art Street, Creative City, CC 12345",
    shipping_phone: "+1 (555) 123-4567",
    total_amount: 449.98,
    items: [
      {
        id: "1",
        order_id: "1",
        product_id: "1",
        product_name: "Abstract Sunset",
        color_name: "Original",
        quantity: 1,
        price: 299.99,
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: "2",
        order_id: "1",
        product_id: "3",
        product_name: "Nature Photography",
        color_name: "Standard",
        quantity: 1,
        price: 149.99,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-25",
  },
];
