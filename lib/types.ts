export interface User {
  id: string
  email: string
  name: string
  image?: string
  phone?: string
  address?: string
  role: 'user' | 'admin'

  favorites: {
    addedAt: string;
    productId: string;
  }[];
  cart: {
    quantity: number;
    productId: string;
  }[];
  orders: string[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  colors: ProductColor[];
  category_id: string;
  likes: number;
  ordered: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  color_name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "cod" | "card" | "paypal";
  shipping_address: string;
  shipping_phone: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  color_name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details: Record<string, any>;
  created_at: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ActivityLog, "id" | "created_at">>;
      };
    };
  };
}
