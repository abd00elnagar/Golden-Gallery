import { supabase, createServerClient } from "./supabase"
import type { Database } from "./supabase"

// --- TYPES ---
export interface ProductColor {
  name: string
  hex: string
  image: string
}

export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  category?: Database["public"]["Tables"]["categories"]["Row"]
  colors?: Database["public"]["Tables"]["product_colors"]["Row"][]
}

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  user?: Database["public"]["Tables"]["users"]["Row"]
  items?: Database["public"]["Tables"]["order_items"]["Row"][]
}

// --- IMAGE UPLOAD ---
export async function uploadImage(file: File, folder: string = ""): Promise<string | null> {
  const serverClient = createServerClient()
  const filePath = `${folder ? folder + "/" : ""}${Date.now()}-${file.name}`
  const { data, error } = await serverClient.storage.from("images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })
  if (error) {
    console.error("Error uploading image:", error)
    return null
  }
  const { data: urlData } = serverClient.storage.from("images").getPublicUrl(filePath)
  return urlData?.publicUrl || null
}

// --- PRODUCT ACTIONS ---
export async function getProducts(search?: string, categoryName?: string): Promise<Product[]> {
  try {
    let query = supabase.from("products").select(`*,categories(id, name, description)`)
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (categoryName && categoryName !== "all") {
      const { data: category } = await supabase.from("categories").select("id").eq("name", categoryName).single()
      if (category) {
        query = query.eq("category_id", category.id)
      }
    }
    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) return []
    if (!data) return []
    const transformedData = await Promise.all(
      data.map(async (item: any) => {
        const { data: colors } = await supabase.from("product_colors").select("*").eq("product_id", item.id)
        return {
          ...item,
          category: item.categories,
          colors: colors || [],
        }
      })
    )
    return transformedData
  } catch {
    return []
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`*,categories(id, name, description)`)
      .eq("id", id)
      .single()
    if (error) return null
    const { data: colors } = await supabase.from("product_colors").select("*").eq("product_id", id)
    return {
      ...data,
      category: data.categories,
      colors: colors || [],
    }
  } catch {
    return null
  }
}

export async function createProduct(product: Database["public"]["Tables"]["products"]["Insert"]): Promise<Product | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("products")
      .insert(product)
      .select(`*,categories(id, name, description)`)
      .single()
    if (error) return null
    return {
      ...data,
      category: data.categories,
      colors: [],
    }
  } catch {
    return null
  }
}

export async function updateProduct(id: string, updates: Database["public"]["Tables"]["products"]["Update"]): Promise<Product | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(`*,categories(id, name, description)`)
      .single()
    if (error) return null
    const { data: colors } = await serverClient.from("product_colors").select("*").eq("product_id", id)
    return {
      ...data,
      category: data.categories,
      colors: colors || [],
    }
  } catch {
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const serverClient = createServerClient()
    const { error } = await serverClient.from("products").delete().eq("id", id)
    return !error
  } catch {
    return false
  }
}

// --- CATEGORY ACTIONS ---
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

export async function getCategory(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function createCategory(category: Database["public"]["Tables"]["categories"]["Insert"]): Promise<Category | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient.from("categories").insert(category).select().single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function updateCategory(id: string, updates: Database["public"]["Tables"]["categories"]["Update"]): Promise<Category | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient.from("categories").update(updates).eq("id", id).select().single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const serverClient = createServerClient()
    const { error } = await serverClient.from("categories").delete().eq("id", id)
    return !error
  } catch {
    return false
  }
}

// --- CART ACTIONS ---
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  const serverClient = createServerClient()
  const { data: user, error } = await serverClient.from("users").select("cart").eq("id", userId).single()
  if (error || !user) return false
  let cart = user.cart || []
  const idx = cart.findIndex((item: any) => item.productId === productId)
  if (idx > -1) {
    cart[idx].quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }
  const { error: updateError } = await serverClient.from("users").update({ cart }).eq("id", userId)
  return !updateError
}

export async function removeFromCart(userId: string, productId: string) {
  const serverClient = createServerClient()
  const { data: user, error } = await serverClient.from("users").select("cart").eq("id", userId).single()
  if (error || !user) return false
  let cart = user.cart || []
  cart = cart.filter((item: any) => item.productId !== productId)
  const { error: updateError } = await serverClient.from("users").update({ cart }).eq("id", userId)
  return !updateError
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number) {
  const serverClient = createServerClient()
  const { data: user, error } = await serverClient.from("users").select("cart").eq("id", userId).single()
  if (error || !user) return false
  let cart = user.cart || []
  const idx = cart.findIndex((item: any) => item.productId === productId)
  if (idx > -1) {
    cart[idx].quantity = quantity
  }
  const { error: updateError } = await serverClient.from("users").update({ cart }).eq("id", userId)
  return !updateError
}

// --- FAVORITES ACTIONS ---
export async function addToFavorites(userId: string, productId: string) {
  const serverClient = createServerClient()
  const { data: user, error } = await serverClient.from("users").select("favorites").eq("id", userId).single()
  if (error || !user) return false
  let favorites = user.favorites || []
  if (!favorites.find((item: any) => item.productId === productId)) {
    favorites.push({ productId, addedAt: new Date().toISOString() })
    await serverClient.from("users").update({ favorites }).eq("id", userId)
    await serverClient.rpc("increment_product_likes", { product_id: productId })
  }
  return true
}

export async function removeFromFavorites(userId: string, productId: string) {
  const serverClient = createServerClient()
  const { data: user, error } = await serverClient.from("users").select("favorites").eq("id", userId).single()
  if (error || !user) return false
  let favorites = user.favorites || []
  favorites = favorites.filter((item: any) => item.productId !== productId)
  await serverClient.from("users").update({ favorites }).eq("id", userId)
  return true
}

// --- ORDER ACTIONS ---
export async function getOrders(): Promise<Order[]> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("orders")
      .select(`*,users(id, name, email, phone, address),order_items(*)`)
      .order("created_at", { ascending: false })
    if (error) return []
    return (
      data?.map((order: any) => ({
        ...order,
        user: order.users,
        items: order.order_items,
      })) || []
    )
  } catch {
    return []
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("orders")
      .select(`*,users(id, name, email, phone, address),order_items(*)`)
      .eq("id", id)
      .single()
    if (error) return null
    return {
      ...data,
      user: data.users,
      items: data.order_items,
    }
  } catch {
    return null
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("orders")
      .select(`*,users(id, name, email, phone, address),order_items(*)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) return []
    return (
      data?.map((order: any) => ({
        ...order,
        user: order.users,
        items: order.order_items,
      })) || []
    )
  } catch {
    return []
  }
}

export async function createOrder(
  orderData: Database["public"]["Tables"]["orders"]["Insert"],
  items: Database["public"]["Tables"]["order_items"]["Insert"][],
): Promise<Order | null> {
  try {
    const serverClient = createServerClient()
    const { data: order, error: orderError } = await serverClient.from("orders").insert(orderData).select().single()
    if (orderError) return null
    const orderItems = items.map((item) => ({ ...item, order_id: order.id }))
    const { error: itemsError } = await serverClient.from("order_items").insert(orderItems)
    if (itemsError) {
      await serverClient.from("orders").delete().eq("id", order.id)
      return null
    }
    return await getOrder(order.id)
  } catch {
    return null
  }
}

export async function updateOrderStatus(id: string, status: Database["public"]["Tables"]["orders"]["Row"]["status"]): Promise<Order | null> {
  try {
    const serverClient = createServerClient()
    const { data, error } = await serverClient
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select(`*,users(id, name, email, phone, address),order_items(*)`)
      .single()
    if (error) return null
    return {
      ...data,
      user: data.users,
      items: data.order_items,
    }
  } catch {
    return null
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const serverClient = createServerClient()
    const { error } = await serverClient.from("orders").delete().eq("id", id)
    return !error
  } catch {
    return false
  }
}

// --- USER PROFILE ACTIONS ---
export async function updateUserProfile(userId: string, updates: Partial<Database["public"]["Tables"]["users"]["Update"]>) {
  const serverClient = createServerClient()
  const { error } = await serverClient.from("users").update(updates).eq("id", userId)
  return !error
}
