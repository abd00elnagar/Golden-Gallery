"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getProducts,
  deleteProduct as deleteProductFromDB,
  createProduct,
  updateProduct as updateProductFromDB,
  type Product,
} from "@/lib/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Extend the default session user type to include role
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function deleteProduct(productId: string) {
  try {
    const success = await deleteProductFromDB(productId);
    if (!success) {
      return { error: "Failed to delete product" };
    }
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
}

export async function searchProducts(searchQuery: string, categoryId: string) {
  try {
    const products = await getProducts();
    const filteredProducts = products.filter((product) => {
      const matchesSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesCategory =
        categoryId === "all" || product.category_id === categoryId;
      return matchesSearch && matchesCategory;
    });

    return { success: true, products: filteredProducts };
  } catch (error) {
    console.error("Search products error:", error);
    return { error: "Failed to search products" };
  }
}

export async function createNewProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    console.log("Debug - Current user session:", { session, user });

    const imagesStr = formData.get("images") as string;
    const images = imagesStr
      ? imagesStr.split(",").map((img) => img.trim())
      : [];

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      category_id: formData.get("category_id") as string,
      images: images,
      colors: JSON.parse(formData.get("colors") as string),
      likes: 0,
      featured: formData.get("featured") === "true",
    };

    console.log("Debug - Creating product with data:", productData);
    const newProduct = await createProduct(productData);
    console.log("Debug - Create product result:", newProduct);

    if (!newProduct) {
      throw new Error("Failed to create product - database returned null");
    }

    revalidatePath("/admin/products");
    return { success: true, product: newProduct };
  } catch (error: any) {
    // Log the full error for debugging
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Return the raw error
    return {
      success: false,
      error: error.message || error.toString(),
      serverError: error,
    };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    console.log("Debug - Current user session:", { session, user });

    const imagesStr = formData.get("images") as string;
    const images = imagesStr
      ? imagesStr.split(",").map((img) => img.trim())
      : [];

    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      category_id: formData.get("category_id") as string,
      images: images,
      colors: JSON.parse(formData.get("colors") as string),
      featured: formData.get("featured") === "true",
    };

    console.log("Debug - Updating product with data:", { productId, updates });
    const updatedProduct = await updateProductFromDB(productId, updates);
    console.log("Debug - Update product result:", updatedProduct);

    if (!updatedProduct) {
      throw new Error("Failed to update product - database returned null");
    }

    revalidatePath("/admin/products");
    return { success: true, product: updatedProduct };
  } catch (error: any) {
    // Log the full error for debugging
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Return the raw error
    return {
      success: false,
      error: error.message || error.toString(),
      serverError: error,
    };
  }
}
