export interface User {
  id: string
  email: string
  name: string
  image?: string
  favorites: string[]
  cart: CartItem[]
  orders: string[]
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category_id: string
  likes: number
  ordered: number
  colors: ProductColor[]
  created_at: string
}

export interface ProductColor {
  id: string
  product_id: string
  name: string
  hex: string
  image: string
}

export interface Category {
  id: string
  name: string
  description: string
}

export interface CartItem {
  product_id: string
  product_name: string
  color_id: string
  color_name: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_method: string
  shipping_address: string
  shipping_phone: string
  total_amount: number
  items: OrderItem[]
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  color_name: string
  quantity: number
  price: number
  image: string
}
