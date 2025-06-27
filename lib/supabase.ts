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

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          image: string | null;
          phone: string | null;
          address: string | null;
          role: "user" | "admin";
          google_id: string | null;
          favorites: {
            items: {
              productId: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                favoriteCount: number;
              };
            }[];
          } | null;
          cart: {
            items: {
              productId: string;
              quantity: number;
              color?: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                originalPrice?: number;
              };
            }[];
          } | null;
          orders: {
            items: {
              orderId: string;
              orderNumber: string;
              status: string;
              totalAmount: number;
              createdAt: string;
              items: {
                productId: string;
                quantity: number;
                price: number;
                color?: string;
                productName: string;
              }[];
            }[];
          } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          image?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "user" | "admin";
          google_id?: string | null;
          favorites?: {
            items: {
              productId: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                favoriteCount: number;
              };
            }[];
          } | null;
          cart?: {
            items: {
              productId: string;
              quantity: number;
              color?: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                originalPrice?: number;
              };
            }[];
          } | null;
          orders?: {
            items: {
              orderId: string;
              orderNumber: string;
              status: string;
              totalAmount: number;
              createdAt: string;
              items: {
                productId: string;
                quantity: number;
                price: number;
                color?: string;
                productName: string;
              }[];
            }[];
          } | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          image?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "user" | "admin";
          google_id?: string | null;
          favorites?: {
            items: {
              productId: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                favoriteCount: number;
              };
            }[];
          } | null;
          cart?: {
            items: {
              productId: string;
              quantity: number;
              color?: string;
              addedAt: string;
              productData: {
                name: string;
                price: number;
                image: string;
                originalPrice?: number;
              };
            }[];
          } | null;
          orders?: {
            items: {
              orderId: string;
              orderNumber: string;
              status: string;
              totalAmount: number;
              createdAt: string;
              items: {
                productId: string;
                quantity: number;
                price: number;
                color?: string;
                productName: string;
              }[];
            }[];
          } | null;
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image: string | null;
          category_id: string | null;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image?: string | null;
          category_id?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          category_id?: string | null;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_colors: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          hex_code: string;
          image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          hex_code: string;
          image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          hex_code?: string;
          image?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          total_amount: number;
          shipping_address: string;
          shipping_phone: string;
          payment_method: "card" | "cod";
          status:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          total_amount: number;
          shipping_address: string;
          shipping_phone: string;
          payment_method: "card" | "cod";
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          total_amount?: number;
          shipping_address?: string;
          shipping_phone?: string;
          payment_method?: "card" | "cod";
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          color_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          color_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          color_name?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
