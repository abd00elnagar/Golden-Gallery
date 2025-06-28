import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client for unauthenticated access (products, categories)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Server-side client for admin operations using service role key
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Database types matching the new schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          image: string | null;
          role: "user" | "admin";
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
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          image?: string | null;
          role?: "user" | "admin";
          favorites?: {
            addedAt: string;
            productId: string;
          }[];
          cart?: {
            quantity: number;
            productId: string;
          }[];
          orders?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          image?: string | null;
          role?: "user" | "admin";
          favorites?: {
            addedAt: string;
            productId: string;
          }[];
          cart?: {
            quantity: number;
            productId: string;
          }[];
          orders?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          colors: {
            name: string;
            hex: string;
            image: string;
          }[];
          category_id: string | null;
          likes: number;
          ordered: number;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          colors?: {
            name: string;
            hex: string;
            image: string;
          }[];
          category_id?: string | null;
          likes?: number;
          ordered?: number;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          colors?: {
            name: string;
            hex: string;
            image: string;
          }[];
          category_id?: string | null;
          likes?: number;
          ordered?: number;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          payment_method: "cod" | "card" | "paypal";
          shipping_address: string;
          shipping_phone: string;
          total_amount: number;
          items: {
            product_id: string;
            product_name: string;
            color_name: string;
            quantity: number;
            price: number;
            image: string;
          }[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          payment_method?: "cod" | "card" | "paypal";
          shipping_address: string;
          shipping_phone: string;
          total_amount: number;
          items: {
            product_id: string;
            product_name: string;
            color_name: string;
            quantity: number;
            price: number;
            image: string;
          }[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
          payment_method?: "cod" | "card" | "paypal";
          shipping_address?: string;
          shipping_phone?: string;
          total_amount?: number;
          items?: {
            product_id: string;
            product_name: string;
            color_name: string;
            quantity: number;
            price: number;
            image: string;
          }[];
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}
