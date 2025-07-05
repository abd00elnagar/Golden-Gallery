import type { Product, Category, User, Order } from "./types";

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Furniture",
    description: "Quality furniture for every room",
  },
  {
    id: "2",
    name: "Kitchenware",
    description: "Essential kitchen tools and cookware",
  },
  {
    id: "3",
    name: "Home Decor",
    description: "Stylish decor for your home",
  },
  { id: "4", name: "Appliances", description: "Modern home appliances" },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Modern Sofa",
    description: "A comfortable modern sofa perfect for your living room.",
    price: 899.99,
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
        name: "Gray",
        hex: "#B0B0B0",
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: "2",
        product_id: "1",
        name: "Blue",
        hex: "#4A90E2",
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-15",
  },
  {
    id: "2",
    name: "Stainless Steel Cookware Set",
    description: "Durable and stylish cookware set for all your kitchen needs.",
    price: 299.99,
    stock: 8,
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
        name: "Black",
        hex: "#222222",
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-10",
  },
  {
    id: "3",
    name: "Wall Art Clock",
    description: "A decorative wall clock to enhance your home decor.",
    price: 79.99,
    stock: 15,
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
        name: "White",
        hex: "#FFFFFF",
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
      product_name: "Modern Sofa",
      color_id: "1",
      color_name: "Gray",
      quantity: 1,
      price: 899.99,
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
    shipping_phone: "+20 155 900 5729",
    total_amount: 449.98,
    items: [
      {
        id: "1",
        order_id: "1",
        product_id: "1",
        product_name: "Modern Sofa",
        color_name: "Gray",
        quantity: 1,
        price: 899.99,
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: "2",
        order_id: "1",
        product_id: "3",
        product_name: "Wall Art Clock",
        color_name: "White",
        quantity: 1,
        price: 79.99,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    created_at: "2024-01-25",
  },
];
