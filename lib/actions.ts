"use server";

import { supabaseClient, createServerClient } from "@/lib/supabase";
import type { Database } from "./supabase";
import { getServerSession } from "next-auth";
import { authOptions, getUser } from "./auth";
import { Category } from "./types";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "./email";
import type { User } from "./types";

// Helper function to check if user is admin
async function isCurrentUserAdmin() {
  const user = await getUser();
  return user?.role === "admin";
}

// --- TYPES ---
export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  category?: Database["public"]["Tables"]["categories"]["Row"];
};

export type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  user?: Database["public"]["Tables"]["users"]["Row"];
};

// --- IMAGE UPLOAD ---
export async function uploadImage(
  file: File,
  folder: string = ""
): Promise<string | null> {
  const serverClient = createServerClient();
  try {
    const filePath = `${folder ? folder + "/" : ""}${Date.now()}-${file.name}`;
    const { data, error } = await serverClient.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) return null;
    const { data: urlData } = serverClient.storage
      .from("images")
      .getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  } catch {
    return null;
  }
}

// --- PRODUCT ACTIONS ---
export async function getProducts(): Promise<Product[]> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("products")
      .select("*")
      .order("likes", { ascending: false });
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createProduct(
  product: Database["public"]["Tables"]["products"]["Insert"]
): Promise<Product | null> {
  // Authentication wall - only admins can create products
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized: Only admins can create products");
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error("Database error creating product:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create product: No data returned");
    }

    return data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  updates: Database["public"]["Tables"]["products"]["Update"]
): Promise<Product | null> {
  // Authentication wall - only admins can update products
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to update product");
    return null;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error updating product:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Exception updating product:", err);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  // Authentication wall - only admins can delete products
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to delete product");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { error } = await serverClient.from("products").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// --- CATEGORY ACTIONS ---
export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return categories;
}

export async function getCategory(id: string): Promise<Category | null> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createCategory(
  category: Database["public"]["Tables"]["categories"]["Insert"]
): Promise<Category | null> {
  // Authentication wall - only admins can create categories
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to create category");
    return null;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("categories")
      .insert(category)
      .select()
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateCategory(
  id: string,
  updates: Database["public"]["Tables"]["categories"]["Update"]
): Promise<Category | null> {
  // Authentication wall - only admins can update categories
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to update category");
    return null;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getCategoryProductCount(id: string): Promise<number> {
  const serverClient = createServerClient();
  try {
    const { count, error } = await serverClient
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (error) {
      console.error("Error counting products in category:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Exception counting products in category:", error);
    return 0;
  }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  // Authentication wall - only admins can delete categories
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to delete category");
    return { success: false, error: "Unauthorized" };
  }

  const serverClient = createServerClient();
  try {
    // Check for products in the category
    const productCount = await getCategoryProductCount(id);
    if (productCount > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${productCount} product(s) are using this category. Please move or delete the products first.`,
      };
    }

    // If no products, proceed with deletion
    const { error } = await serverClient
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: "Failed to delete category" };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception deleting category:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// --- CART ACTIONS ---
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<boolean> {
  // Authentication wall - users can only modify their own cart
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify cart");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let cart = user.cart || [];
    const idx = cart.findIndex((item: any) => item.productId === productId);
    if (idx > -1) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    const { error: updateError } = await serverClient
      .from("users")
      .update({ cart })
      .eq("id", userId);
    return !updateError;
  } catch {
    return false;
  }
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<boolean> {
  // Authentication wall - users can only modify their own cart
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify cart");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let cart = user.cart || [];
    cart = cart.filter((item: any) => item.productId !== productId);
    const { error: updateError } = await serverClient
      .from("users")
      .update({ cart })
      .eq("id", userId);
    return !updateError;
  } catch {
    return false;
  }
}

export async function updateCartQuantity(
  userId: string,
  productId: string,
  quantity: number
): Promise<boolean> {
  // Authentication wall - users can only modify their own cart
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify cart");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let cart = user.cart || [];
    const idx = cart.findIndex((item: any) => item.productId === productId);
    if (idx > -1) {
      cart[idx].quantity = quantity;
      const { error: updateError } = await serverClient
        .from("users")
        .update({ cart })
        .eq("id", userId);
      return !updateError;
    }
    return false;
  } catch {
    return false;
  }
}

// --- FAVORITES ACTIONS ---
export async function addToFavorites(
  userId: string,
  productId: string
): Promise<boolean> {
  // Authentication wall - users can only modify their own favorites
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify favorites");
    return false;
  }

  try {
    const { data: user, error } = await supabaseClient
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let favorites = user.favorites || [];
    const existingIndex = favorites.findIndex(
      (fav: any) => fav.productId === productId
    );

    if (existingIndex === -1) {
      favorites.push({ productId, addedAt: new Date().toISOString() });
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ favorites })
        .eq("id", userId);
      return !updateError;
    }
    return true;
  } catch {
    return false;
  }
}

export async function removeFromFavorites(
  userId: string,
  productId: string
): Promise<boolean> {
  // Authentication wall - users can only modify their own favorites
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify favorites");
    return false;
  }

  try {
    const { data: user, error } = await supabaseClient
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let favorites = user.favorites || [];
    favorites = favorites.filter((fav: any) => fav.productId !== productId);
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({ favorites })
      .eq("id", userId);
    return !updateError;
  } catch {
    return false;
  }
}

// Form action wrappers for useFormState
export async function toggleFavoriteAction(
  prevState: { success: boolean; message: string },
  formData: FormData
) {
  const productId = formData.get("productId") as string;
  const isFavorite = formData.get("isFavorite") === "true";
  const user = await getUser();

  if (!user || !productId) {
    return { success: false, message: "Missing user or product information" };
  }

  try {
    const success = isFavorite
      ? await removeFromFavorites(user.id, productId)
      : await addToFavorites(user.id, productId);

    return {
      success,
      message: success
        ? isFavorite
          ? "Removed from favorites"
          : "Added to favorites"
        : "Failed to update favorites",
    };
  } catch (error) {
    return { success: false, message: "An error occurred" };
  }
}

// Server actions for client-side calls
export async function addToFavoritesServerAction(
  userId: string,
  productId: string
): Promise<boolean> {
  // Authentication wall - users can only modify their own favorites
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify favorites");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let favorites = user.favorites || [];
    favorites.push({ productId, addedAt: new Date().toISOString() });
    const { error: updateError } = await serverClient
      .from("users")
      .update({ favorites })
      .eq("id", userId);
    return !updateError;
    return true;
  } catch {
    return false;
  }
}

export async function removeFromFavoritesServerAction(
  userId: string,
  productId: string
): Promise<boolean> {
  // Authentication wall - users can only modify their own favorites
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to modify favorites");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();
    if (error || !user) return false;
    let favorites = user.favorites || [];
    favorites = favorites.filter((fav: any) => fav.productId !== productId);
    const { error: updateError } = await serverClient
      .from("users")
      .update({ favorites })
      .eq("id", userId);
    return !updateError;
  } catch {
    return false;
  }
}

// --- ORDER ACTIONS ---
export async function getOrders(): Promise<Order[]> {
  // Authentication wall - only admins can view all orders
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to view all orders");
    return [];
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  // Authentication wall - users can only view their own orders, admins can view any order
  const currentUser = await getUser();
  if (!currentUser) {
    console.error("Unauthorized attempt to view order");
    return null;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;

    // Check if user is admin or owns the order
    if (currentUser.role !== "admin" && data.user_id !== currentUser.id) {
      console.error("Unauthorized attempt to view order");
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  // Authentication wall - users can only view their own orders
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to view user orders");
    return [];
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createOrder(
  orderData: Database["public"]["Tables"]["orders"]["Insert"]
): Promise<Order | null> {
  // Authentication wall - users can only create orders for themselves
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== orderData.user_id) {
    console.error("Unauthorized attempt to create order");
    return null;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("orders")
      .insert(orderData)
      .select()
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: Database["public"]["Tables"]["orders"]["Row"]["status"]
): Promise<Order | null> {
  // Authentication wall - only admins can update order status
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to update order status");
    return null;
  }

  const serverClient = createServerClient();
  try {
    // First get the order to get user details
    const { data: order, error: orderError } = await serverClient
      .from("orders")
      .select("*, user:user_id(*)")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return null;
    }

    // Update the order status
    const { data: updatedOrder, error: updateError } = await serverClient
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return null;
    }

    // Add notification for status update
    if (order.user) {
      const notifications = order.user.notifications || [];
      notifications.unshift({
        id: crypto.randomUUID(),
        orderId: order.id,
        message: `Your order #${order.order_number} status has been updated to ${status}.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Update user notifications
      await serverClient
        .from("users")
        .update({ notifications })
        .eq("id", order.user.id);
    }

    // Send email notification to the user
    if (order.user && order.user.email) {
      try {
        await sendOrderStatusUpdateEmail(
          order.user.email,
          order.user.name || "Valued Customer",
          order.order_number,
          status,
          null,
          order.id
        );
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
        // Don't fail the update if email fails
      }
    }

    return updatedOrder;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return null;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  // Authentication wall - only admins can delete orders
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.error("Unauthorized attempt to delete order");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { error } = await serverClient.from("orders").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// --- USER ACTIONS ---
export async function updateUserProfile(
  userId: string,
  updates: Partial<Database["public"]["Tables"]["users"]["Update"]>
): Promise<boolean> {
  // Authentication wall - users can only update their own profile
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to update user profile");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { error } = await serverClient
      .from("users")
      .update(updates)
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  // Authentication wall - users can only check their own admin status
  const currentUser = await getUser();
  if (!currentUser || currentUser.id !== userId) {
    console.error("Unauthorized attempt to check admin status");
    return false;
  }

  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    if (error || !data) return false;
    return data.role === "admin";
  } catch {
    return false;
  }
}

// --- FAVORITES SERVER ACTION ---
export async function toggleFavorite(prevState: any, formData: FormData) {
  const productId = formData.get("productId") as string;
  const isFavorite = formData.get("isFavorite") === "true";
  const user = await getUser();

  if (!user || !productId) {
    return { error: "Missing user or product information" };
  }

  try {
    const serverClient = createServerClient();

    // console.log("Current user favorites:", user.favorites)
    let favorites = user.favorites || [];

    if (isFavorite) {
      // Remove from favorites
      favorites = favorites.filter((fav: any) => fav.productId !== productId);
      // console.log("Removing from favorites, new array:", favorites)
    } else {
      // Add to favorites
      const existingIndex = favorites.findIndex(
        (fav: any) => fav.productId === productId
      );
      if (existingIndex === -1) {
        favorites.push({ productId, addedAt: new Date().toISOString() });
        // console.log("Adding to favorites, new array:", favorites)
      }
    }

    // Update user favorites
    const { error: updateUserError } = await serverClient
      .from("users")
      .update({ favorites })
      .eq("id", user.id);

    if (updateUserError) {
      console.error("Update user error:", updateUserError);
      return { error: "Failed to update favorites" };
    }

    // Update product likes count (skip if product doesn't exist)
    const { data: product, error: productError } = await serverClient
      .from("products")
      .select("likes")
      .eq("id", productId)
      .single();

    if (productError) {
      // If product doesn't exist, just update user favorites without updating product likes
      console.log(
        "Product not found, skipping likes update for product:",
        productId
      );
      return {
        success: true,
        isFavorite: !isFavorite,
        likes: 0, // Product doesn't exist, so likes is 0
        message: isFavorite ? "Removed from favorites" : "Added to favorites",
      };
    }

    if (!product) {
      // Product doesn't exist, just update user favorites
      return {
        success: true,
        isFavorite: !isFavorite,
        likes: 0,
        message: isFavorite ? "Removed from favorites" : "Added to favorites",
      };
    }

    const newLikes = isFavorite
      ? Math.max(0, product.likes - 1)
      : product.likes + 1;

    const { error: updateProductError } = await serverClient
      .from("products")
      .update({ likes: newLikes })
      .eq("id", productId);

    if (updateProductError) {
      console.error("Update product error:", updateProductError);
      return { error: "Failed to update product likes" };
    }

    // console.log("Successfully updated favorites and likes")
    return {
      success: true,
      isFavorite: !isFavorite,
      likes: newLikes,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
    };
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return { error: "An error occurred while updating favorites" };
  }
}

// --- CART SERVER ACTIONS ---
export async function addToCartAction(prevState: any, formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const selectedColor = formData.get("selectedColor") as string;
  const user = await getUser();

  if (!user || !productId) {
    return { error: "Missing user or product information" };
  }

  try {
    const serverClient = createServerClient();

    // Get product details to include in cart
    const { data: product, error: productError } = await serverClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return { error: "Product not found" };
    }

    // Only validate color if one was selected
    if (selectedColor) {
      const colorExists = product.colors.some(
        (color: any) => color.name === selectedColor
      );
      if (!colorExists) {
        return { error: "Invalid color selected" };
      }
    }

    let cart = user.cart || [];
    const existingItemIndex = cart.findIndex(
      (item: any) =>
        item.productId === productId && item.color === selectedColor
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart with optional color information
      cart.push({
        productId,
        quantity,
        color: selectedColor || "",
        productName: product.name,
        price: product.price,
        image: product.images[0] || null,
      });
    }

    const { error: updateError } = await serverClient
      .from("users")
      .update({ cart })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update cart error:", updateError);
      return { error: "Failed to update cart" };
    }

    return {
      success: true,
      message: existingItemIndex > -1 ? "Cart updated" : "Added to cart",
      cartItemCount: cart.length,
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { error: "An error occurred while updating cart" };
  }
}

// --- USER DATA ACTIONS ---
export async function getUserCartCount(userId: string): Promise<number> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error || !data) return 0;
    return data.cart?.length || 0;
  } catch {
    return 0;
  }
}

export async function getUserFavoritesCount(userId: string): Promise<number> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("favorites")
      .eq("id", userId)
      .single();
    if (error || !data) return 0;
    return data.favorites?.length || 0;
  } catch {
    return 0;
  }
}

// --- CART ITEMS ACTIONS ---
export async function getUserCartItems(userId: string): Promise<any[]> {
  const serverClient = createServerClient();
  try {
    const { data: user, error } = await serverClient
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error || !user || !user.cart) return [];

    // Get product details for each cart item
    const cartItems = [];
    for (const cartItem of user.cart) {
      const { data: product, error: productError } = await serverClient
        .from("products")
        .select("*")
        .eq("id", cartItem.productId)
        .single();

      if (!productError && product) {
        cartItems.push({
          productId: cartItem.productId,
          productName: product.name,
          price: product.price,
          image: product.images?.[0] || null,
          quantity: cartItem.quantity,
          stock: product.stock,
          color_name: cartItem.color || "",
        });
      } else {
        cartItems.push({
          productId: cartItem.productId,
          notFound: true,
        });
      }
    }

    return cartItems;
  } catch {
    return [];
  }
}

// --- CART UPDATE ACTIONS ---
export async function updateCartQuantityAction(
  prevState: any,
  formData: FormData
) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 0;
  const user = await getUser();

  if (!user || !productId) {
    return { error: "Missing user or product information" };
  }

  try {
    const serverClient = createServerClient();

    let cart = user.cart || [];

    if (quantity === 0) {
      // Remove item from cart
      cart = cart.filter((item: any) => item.productId !== productId);
    } else {
      // Update quantity
      const existingItemIndex = cart.findIndex(
        (item: any) => item.productId === productId
      );
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = quantity;
      }
    }

    const { error: updateError } = await serverClient
      .from("users")
      .update({ cart })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update cart error:", updateError);
      return { error: "Failed to update cart" };
    }

    return {
      success: true,
      message: quantity === 0 ? "Item removed from cart" : "Cart updated",
      cartItemCount: cart.length,
    };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return { error: "An error occurred while updating cart" };
  }
}

export async function removeFromCartAction(prevState: any, formData: FormData) {
  const productId = formData.get("productId") as string;
  const user = await getUser();

  if (!user || !productId) {
    return { error: "Missing user or product information" };
  }

  try {
    const serverClient = createServerClient();

    let cart = user.cart || [];
    cart = cart.filter((item: any) => item.productId !== productId);

    const { error: updateError } = await serverClient
      .from("users")
      .update({ cart })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update cart error:", updateError);
      return { error: "Failed to update cart" };
    }

    return {
      success: true,
      message: "Item removed from cart",
      cartItemCount: cart.length,
    };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { error: "An error occurred while removing item from cart" };
  }
}

export async function createOrderAction(prevState: any, formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: "User not authenticated" };
    }

    // Extract shipping and order info from formData
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const isBuyNow = formData.get("buyNow") === "1";

    // Get cart items - for Buy Now, we need to get from form data
    let cartItems = [];
    if (isBuyNow) {
      // For Buy Now, the cart items should be passed in the form data
      const cartItemsJson = formData.get("cartItems") as string;
      if (cartItemsJson) {
        cartItems = JSON.parse(cartItemsJson);
      }
    } else {
      // For regular cart checkout, get from user's cart
      cartItems = await getUserCartItems(user && user.id);
    }

    if (!cartItems.length) return { error: "Cart is empty" };

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal;

    // Create order object
    const orderData = {
      user_id: user && user.id,
      order_number: `ORD-${Date.now()}`,
      status: "pending" as "pending",
      payment_method: "cod" as "cod",
      shipping_address: address,
      shipping_phone: phone,
      total_amount: total,
      items: cartItems.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        color_name: item.color_name || "",
      })),
      created_at: new Date().toISOString(),
    };

    // Save order in DB
    const order = await createOrder(orderData);
    if (!order) return { error: "Failed to create order" };

    // Add notification for order creation
    const notifications = user.notifications || [];
    notifications.unshift({
      id: crypto.randomUUID(),
      orderId: order.id,
      message: `Your order #${order.order_number} has been placed successfully.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Update user with new notification and clear cart if needed
    const serverClient = createServerClient();
    if (!isBuyNow) {
      await serverClient
        .from("users")
        .update({
          cart: [],
          orders: [...(user.orders || []), order.id],
          notifications,
        })
        .eq("id", user.id);
    } else {
      await serverClient
        .from("users")
        .update({
          orders: [...(user.orders || []), order.id],
          notifications,
        })
        .eq("id", user.id);
    }

    // Send confirmation email
    try {
      console.log(
        `Sending order confirmation email to ${email} for order ${order.order_number}`
      );
      const emailResult = await sendOrderConfirmationEmail({
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        items: cartItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shipping: 0,
        tax: 0,
        total,
        shippingAddress: orderData.shipping_address,
        shippingPhone: orderData.shipping_phone,
        estimatedDelivery: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        orderDate: orderData.created_at,
        status: orderData.status,
      });

      if (emailResult.success) {
        console.log(`Order confirmation email sent successfully to ${email}`);
      } else {
        console.error(
          `Failed to send order confirmation email to ${email}:`,
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return { error: error.message || "Order failed" };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const serverClient = createServerClient();
  try {
    const { data, error } = await serverClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function markNotificationAsRead(
  prevState: any,
  formData: FormData
) {
  const notificationId = formData.get("notificationId") as string;
  const user = await getUser();

  if (!user || !notificationId) {
    return { error: "Missing user or notification information" };
  }

  try {
    const serverClient = createServerClient();
    const notifications = user.notifications || [];

    // Find and mark the notification as read
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    // Update user notifications
    const { error: updateError } = await serverClient
      .from("users")
      .update({ notifications: updatedNotifications })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update notification error:", updateError);
      return { error: "Failed to mark notification as read" };
    }

    return {
      success: true,
      message: "Notification marked as read",
      notifications: updatedNotifications,
    };
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return { error: "An error occurred while updating notification" };
  }
}

export async function markAllNotificationsAsRead(
  prevState: any,
  formData: FormData
) {
  const user = await getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    const serverClient = createServerClient();
    const notifications = user.notifications || [];

    // Mark all unread notifications as read
    const updatedNotifications = notifications.map((notification) =>
      !notification.read ? { ...notification, read: true } : notification
    );

    // Update user notifications in a single operation
    const { error: updateError } = await serverClient
      .from("users")
      .update({ notifications: updatedNotifications })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update all notifications error:", updateError);
      return { error: "Failed to mark all notifications as read" };
    }

    return {
      success: true,
      message: "All notifications marked as read",
      notifications: updatedNotifications,
    };
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return { error: "An error occurred while updating notifications" };
  }
}
